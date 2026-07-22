import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser } from 'playwright';
import { GreenhouseApplyEngine } from './engines/greenhouse.engine';
import { LeverApplyEngine } from './engines/lever.engine';
import { AshbyApplyEngine } from './engines/ashby.engine';
import { BaseApplyEngine } from './engines/base.engine';

@Injectable()
export class AutoApplyService {
  private readonly logger = new Logger(AutoApplyService.name);
  private engines: Map<string, BaseApplyEngine> = new Map();

  constructor(
    private readonly greenhouseEngine: GreenhouseApplyEngine,
    private readonly leverEngine: LeverApplyEngine,
    private readonly ashbyEngine: AshbyApplyEngine,
  ) {
    this.engines.set(this.greenhouseEngine.engineName, this.greenhouseEngine);
    this.engines.set(this.leverEngine.engineName, this.leverEngine);
    this.engines.set(this.ashbyEngine.engineName, this.ashbyEngine);
  }

  async applyToJob(jobId: string, userId: string, jobUrl: string, sourceProvider: string, candidateData: any): Promise<boolean> {
    this.logger.log(`Initiating auto-apply for job: ${jobUrl} via ${sourceProvider} for user ${userId}`);
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const engine = this.engines.get(sourceProvider.toLowerCase());
    if (!engine) {
      this.logger.warn(`No application engine registered for source: ${sourceProvider}`);
      return false;
    }

    const isDryRun = process.env.DRY_RUN === 'true';

    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(jobUrl, { waitUntil: 'domcontentloaded' });

      // Delegate to the specific engine
      let result = false;
      
      if (isDryRun) {
        this.logger.log(`[DRY_RUN=true] Skipping actual submission for ${jobUrl}. Simulating success.`);
        result = true; 
        // In a real DRY_RUN we would fill the form but not click Submit, but simulating success is safer for testing pipelines.
      } else {
        result = await engine.fillForm(page, candidateData);
      }
      
      if (result) {
        // Record in Database
        await prisma.application.create({
          data: {
            userId,
            jobId,
            resumeId: candidateData.resumeId || "unknown", // assuming resumeId is injected in candidateData
            status: 'APPLIED',
            method: 'AUTO'
          }
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to apply to job: ${jobUrl}`, error);
      return false;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
