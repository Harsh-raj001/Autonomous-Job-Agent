/**
 * resume.processor.ts
 *
 * NOTE: BullMQ is NOT actively used in this project — the resume pipeline
 * runs directly via ResumeService.processResumeBackground() (fire-and-forget).
 *
 * This file is kept as a stub so the @nestjs/bullmq @Processor decorator
 * compiles without errors. If BullMQ Redis is not configured, this worker
 * is never instantiated.
 */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ResumeService } from '../modules/resume/resume.service';

@Processor('resume-queue')
export class ResumeProcessor extends WorkerHost {
  private readonly logger = new Logger(ResumeProcessor.name);

  constructor(private readonly resumeService: ResumeService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`[ResumeProcessor] Received job ${job.id} (${job.name}) — delegating to ResumeService`);

    if (job.name === 'parse-resume') {
      const { filePath, userId } = job.data;
      // Delegate entirely to the refactored service which handles all steps
      await this.resumeService.processResumeBackground(filePath, userId);
      return { success: true };
    }

    this.logger.warn(`[ResumeProcessor] Unknown job name: ${job.name}`);
    return { skipped: true };
  }
}
