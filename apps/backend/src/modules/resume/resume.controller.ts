import { Controller, Post, Body, Req, UseGuards, Get, Query, Logger } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { ResumeService, resumeJobStatus } from './resume.service';
import { prisma } from '../../prisma.singleton';

@Controller('resume')
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);

  constructor(private readonly resumeService: ResumeService) {}

  @Post('parse')
  @UseGuards(SupabaseAuthGuard)
  async parseResume(@Req() req: any, @Body() body: { filePath: string }) {
    const userId = req.user.id;
    const jobKey = `${userId}:${body.filePath}`;

    this.logger.log(`[parse] Received parse request — userId: ${userId}, filePath: ${body.filePath}`);

    if (!body.filePath) {
      this.logger.error('[parse] No filePath provided in request body');
      return { success: false, error: 'filePath is required' };
    }

    // Mark as processing immediately so status endpoint can respond correctly
    resumeJobStatus.set(jobKey, 'PROCESSING');

    // Fire-and-forget — background processing runs asynchronously
    this.resumeService
      .processResumeBackground(body.filePath, userId)
      .catch((err) => {
        this.logger.error(`[parse] Unhandled background error: ${err.message}`);
        resumeJobStatus.set(jobKey, 'FAILED');
      });

    this.logger.log(`[parse] Background job started. jobKey: ${jobKey}`);
    return { success: true, jobKey, message: 'Resume parsing started' };
  }

  @Get('status')
  @UseGuards(SupabaseAuthGuard)
  async getStatus(@Req() req: any, @Query('filePath') filePath: string) {
    const userId = req.user.id;

    if (!filePath) {
      return { status: 'PROCESSING' };
    }

    const jobKey = `${userId}:${filePath}`;

    // First: check the fast in-memory status map
    const memStatus = resumeJobStatus.get(jobKey);

    this.logger.log(`[status] filePath: ${filePath} | memStatus: ${memStatus ?? 'unknown'}`);

    if (memStatus === 'FAILED') {
      return { status: 'FAILED', error: 'Resume processing failed. Please try again.' };
    }

    // Then: check the database for a completed ParsedResume record
    try {
      const resume = await prisma.resume.findFirst({
        where: { userId, fileUrl: filePath },
        include: { parsedResume: true },
      });

      this.logger.log(
        `[status] DB lookup — found resume: ${!!resume}, parsedResume: ${!!resume?.parsedResume}`,
      );

      if (resume?.parsedResume?.data) {
        resumeJobStatus.set(jobKey, 'COMPLETED');
        return { status: 'COMPLETED', parsedData: resume.parsedResume.data };
      }

      // Resume record exists but no parsed data yet → still processing
      return { status: 'PROCESSING' };
    } catch (err: any) {
      this.logger.error(`[status] DB error: ${err.message}`);
      // Don't return FAILED here — the background job might still succeed
      return { status: 'PROCESSING' };
    }
  }
}
