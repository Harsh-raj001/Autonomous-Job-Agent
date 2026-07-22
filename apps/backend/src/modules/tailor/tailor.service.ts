import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class TailorService {
  private readonly logger = new Logger(TailorService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key' });
  }

  async tailorResume(userId: string, jobId: string, resumeId: string): Promise<any> {
    this.logger.log(`Initiating resume tailoring for user ${userId}, job ${jobId}`);
    
    // Fetch original parsed data and job details
    const parsedResume = await prisma.parsedResume.findUnique({ where: { resumeId } });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!parsedResume || !job) {
      throw new Error('Resume or Job not found for tailoring.');
    }

    let tailoredData: any;
    let gapData: any;

    if (process.env.OPENAI_API_KEY === 'dummy_key' || !process.env.OPENAI_API_KEY) {
      tailoredData = { mock: "Mock tailored bullet points because OpenAI is bypassed." };
      gapData = { mock: "Mock ATS gap analysis because OpenAI is bypassed." };
    } else {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert ATS optimization engine. You will receive a parsed resume and a target job description. 
Return a JSON object containing:
1. tailoredContent: Array of rewritten experience bullets that highlight overlap with the job description using industry keywords.
2. gapAnalysis: Array of skills or experiences explicitly required by the job that are missing from the resume.`,
          },
          {
            role: 'user',
            content: `Job: ${job.title} - ${job.description.substring(0, 1000)}\n\nResume: ${JSON.stringify(parsedResume.data).substring(0, 1500)}`,
          },
        ],
        response_format: { type: 'json_object' }
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');
      tailoredData = parsedResponse.tailoredContent || {};
      gapData = parsedResponse.gapAnalysis || {};
    }

    const savedTailor = await prisma.resumeTailor.create({
      data: {
        userId,
        jobId,
        originalResumeId: resumeId,
        tailoredContent: tailoredData,
        gapAnalysis: gapData,
      }
    });

    return savedTailor;
  }
}
