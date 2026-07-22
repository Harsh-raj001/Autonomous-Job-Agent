import { Injectable, Logger } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { prisma } from '../../prisma.singleton';

// pdf-parse v1.1.1 — the standard package exports a single async function directly:
//   const pdfParse = require('pdf-parse');
//   const result = await pdfParse(buffer); // → { text, numpages, info, ... }
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = require('pdf-parse');

// ─── Timeout helper ─────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms),
    ),
  ]);
}

// ─── Status tracking (in-memory, keyed by userId+filePath) ──────────────────
// This lets the status endpoint detect failures without needing a DB schema change.
export const resumeJobStatus = new Map<string, 'PROCESSING' | 'COMPLETED' | 'FAILED'>();

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  private readonly openai: OpenAI;
  private readonly supabase;
  private useGroq = false;
  private useNvidia = false;

  constructor() {
    // Provider priority: Groq (fast, reliable) → NVIDIA NIM → OpenAI
    const useGroq = !!process.env.GROQ_API_KEY;
    const useNvidia = !useGroq && !!process.env.NVIDIA_API_KEY;

    if (useGroq) {
      this.logger.log(`[ResumeService] Using Groq (Llama 3.3 70B) — key ends in ...${process.env.GROQ_API_KEY?.slice(-6)}`);
    } else if (useNvidia) {
      this.logger.log(`[ResumeService] Using NVIDIA NIM (Llama 3.3 70B) — key ends in ...${process.env.NVIDIA_API_KEY?.slice(-6)}`);
    } else {
      this.logger.log(`[ResumeService] Using OpenAI`);
    }

    this.openai = new OpenAI({
      apiKey: useGroq
        ? process.env.GROQ_API_KEY!
        : useNvidia
          ? process.env.NVIDIA_API_KEY!
          : process.env.OPENAI_API_KEY || '',
      baseURL: useGroq
        ? 'https://api.groq.com/openai/v1'
        : useNvidia
          ? 'https://integrate.api.nvidia.com/v1'
          : 'https://api.openai.com/v1',
    });

    // Track which provider we're using for model selection
    this.useGroq = useGroq;
    this.useNvidia = useNvidia;

    // Singleton Supabase client — not recreated on every request
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';

    this.logger.log(`[ResumeService] Supabase URL: ${supabaseUrl}`);

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ─── Step A: Extract text from PDF buffer ─────────────────────────────────
  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    this.logger.log(`[PDF] Extracting text from ${buffer.length}-byte PDF buffer...`);

    const data = await withTimeout(pdfParse(buffer), 30_000, 'pdf-parse');
    const text = data.text?.trim();

    if (!text || text.length < 50) {
      throw new Error(
        `PDF appears empty or unreadable. Extracted ${text?.length ?? 0} chars.`,
      );
    }

    this.logger.log(`[PDF] Extracted ${text.length} characters.`);
    return text;
  }

  // ─── Step B: Parse resume text via LLM ────────────────────────────────────
  async parseResumeWithLLM(text: string): Promise<any> {
    // Groq: llama-3.3-70b-versatile | NIM: meta/llama-3.3-70b-instruct | OpenAI: gpt-4o-mini
    const model = this.useGroq
      ? 'llama-3.3-70b-versatile'
      : this.useNvidia
        ? 'meta/llama-3.3-70b-instruct'
        : 'gpt-4o-mini';

    this.logger.log(`[LLM] Sending ${text.length} chars to model: ${model}`);

    const systemPrompt = `You are an expert resume parser. Extract the following into structured JSON:
- education: [{degree, institution, year}]
- experience: [{title, company, startDate, endDate, achievements: [string]}]
- projects: [{name, description, technologies: [string]}]
- achievements: [string]
- certifications: [string]
- domainExpertise: [string] (e.g. Product Management, Finance, Marketing)
- tools: [string] (e.g. Jira, SQL, Excel, Figma)
- frameworks: [string] (e.g. React, NestJS)
- softSkills: [string] (e.g. Leadership, Communication)
- languages: [string]
- location: string
- portfolioLinks: {github?: string, linkedin?: string, website?: string}

IMPORTANT: Output ONLY valid JSON. No markdown, no code fences, no prose. Start your response with { and end with }.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text.slice(0, 12_000) }, // cap tokens
    ];

    // Groq + NIM: do NOT pass response_format — only OpenAI supports it
    const requestParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages,
      temperature: 0,
      ...(!this.useGroq && !this.useNvidia
        ? { response_format: { type: 'json_object' as const } } // OpenAI only
        : {}),
    };

    const response = await withTimeout(
      this.openai.chat.completions.create(requestParams),
      120_000, // 2 min timeout for LLM
      'LLM chat completion',
    );

    const content = response.choices?.[0]?.message?.content;
    this.logger.log(`[LLM] Raw response (first 300 chars): ${content?.slice(0, 300)}`);

    if (!content) {
      throw new Error('LLM returned empty content.');
    }

    // Extract JSON — find the first { ... } block in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`LLM response did not contain valid JSON. Got: ${content.slice(0, 200)}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    this.logger.log(`[LLM] Successfully parsed JSON with keys: ${Object.keys(parsed).join(', ')}`);
    return parsed;
  }

  // ─── Step C: Generate embeddings (optional, skipped on failure) ────────────
  async generateEmbeddings(skills: string[]): Promise<number[][]> {
    if (skills.length === 0) return [];

    // Groq doesn't have an embeddings endpoint — fall back to NIM or OpenAI
    const model = this.useNvidia ? 'nvidia/nv-embedqa-e5-v5' : 'text-embedding-3-small';

    this.logger.log(`[Embeddings] Generating embeddings for ${skills.length} skills using ${model}...`);

    const response = await withTimeout(
      this.openai.embeddings.create({ model, input: skills }),
      30_000,
      'embedding generation',
    );

    this.logger.log(`[Embeddings] Got ${response.data.length} embeddings.`);
    return response.data.map((d) => d.embedding);
  }

  // ─── Main background pipeline ──────────────────────────────────────────────
  async processResumeBackground(filePath: string, userId: string): Promise<void> {
    const jobKey = `${userId}:${filePath}`;
    resumeJobStatus.set(jobKey, 'PROCESSING');

    this.logger.log(`[Pipeline] ▶ START — user: ${userId}, file: ${filePath}`);

    try {
      // ── 1. Download from Supabase Storage ──────────────────────────────────
      this.logger.log(`[Pipeline] Step 1/6: Downloading from Supabase Storage...`);

      const { data: fileData, error: downloadError } = await withTimeout(
        this.supabase.storage.from('resumes').download(filePath),
        30_000,
        'Supabase storage download',
      );

      if (downloadError || !fileData) {
        throw new Error(
          `Supabase download failed: ${downloadError?.message ?? 'No data returned'}`,
        );
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      this.logger.log(`[Pipeline] Step 1/6: ✓ Downloaded ${buffer.length} bytes.`);

      // ── 2. Extract text from PDF ───────────────────────────────────────────
      this.logger.log(`[Pipeline] Step 2/6: Extracting PDF text...`);
      const resumeText = await this.extractTextFromPdf(buffer);
      this.logger.log(`[Pipeline] Step 2/6: ✓ Extracted ${resumeText.length} chars.`);

      // ── 3. Parse resume with LLM ───────────────────────────────────────────
      this.logger.log(`[Pipeline] Step 3/6: Calling LLM to parse resume...`);
      const parsedData = await this.parseResumeWithLLM(resumeText);
      this.logger.log(`[Pipeline] Step 3/6: ✓ LLM parsing complete.`);

      // ── 4. Upsert Resume record (create before embeddings so status is tracked) ─
      this.logger.log(`[Pipeline] Step 4/6: Upserting Resume record in DB...`);

      let resumeRecord = await prisma.resume.findFirst({
        where: { userId, fileUrl: filePath },
      });

      if (!resumeRecord) {
        resumeRecord = await prisma.resume.create({
          data: { userId, fileUrl: filePath, isActive: true },
        });
      }
      this.logger.log(`[Pipeline] Step 4/6: ✓ Resume record ID: ${resumeRecord.id}`);

      // ── 5. Generate + persist skill embeddings (optional, non-fatal) ────────
      this.logger.log(`[Pipeline] Step 5/6: Generating skill embeddings (optional)...`);
      const skills: string[] = [
        ...(parsedData.tools || []),
        ...(parsedData.frameworks || []),
        ...(parsedData.softSkills || []),
      ].slice(0, 20);

      if (skills.length > 0) {
        try {
          const embeddings = await this.generateEmbeddings(skills);
          if (embeddings.length === skills.length) {
            for (let i = 0; i < skills.length; i++) {
              const skillName = skills[i].toLowerCase().trim();
              try {
                await prisma.$executeRawUnsafe(
                  `INSERT INTO "Skill" (id, name, "createdAt", "updatedAt", embedding)
                   VALUES (gen_random_uuid(), $1, NOW(), NOW(), $2::vector)
                   ON CONFLICT (name) DO NOTHING;`,
                  skillName,
                  `[${embeddings[i].join(',')}]`,
                );
              } catch (e: any) {
                // Non-fatal: skill table may have schema mismatch
                this.logger.warn(`[Pipeline] Skill insert skipped for "${skillName}": ${e.message}`);
              }
            }
            this.logger.log(`[Pipeline] Step 5/6: ✓ Persisted ${skills.length} skill embeddings.`);
          }
        } catch (e: any) {
          this.logger.warn(`[Pipeline] Step 5/6: ⚠ Embeddings skipped (non-fatal): ${e.message}`);
        }
      } else {
        this.logger.log(`[Pipeline] Step 5/6: ✓ No skills to embed.`);
      }

      // ── 6. Save ParsedResume JSON ──────────────────────────────────────────
      this.logger.log(`[Pipeline] Step 6/6: Saving ParsedResume to DB...`);
      await prisma.parsedResume.upsert({
        where: { resumeId: resumeRecord.id },
        update: { data: parsedData },
        create: { resumeId: resumeRecord.id, data: parsedData },
      });
      this.logger.log(`[Pipeline] Step 6/6: ✓ ParsedResume saved.`);

      resumeJobStatus.set(jobKey, 'COMPLETED');
      this.logger.log(`[Pipeline] ✅ COMPLETE — user: ${userId}`);
    } catch (error: any) {
      resumeJobStatus.set(jobKey, 'FAILED');
      this.logger.error(
        `[Pipeline] ❌ FAILED — user: ${userId}\n  Error: ${error.message}\n  Stack: ${error.stack}`,
      );
    }
  }
}
