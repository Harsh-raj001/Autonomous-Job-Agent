import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';
import { chromium } from 'playwright';

@Injectable()
export class AshbyProvider extends BaseJobProvider {
  readonly providerName = 'ashby';
  private readonly logger = new Logger(AshbyProvider.name);

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    this.logger.log(`Discovering Ashby jobs for keywords: ${keywords.join(', ')}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const rawJobs = [];

    try {
      this.logger.log('Navigating to Ashby board...');
      // E.g. https://jobs.ashbyhq.com/example
      // Mocking discovery for MVP
      rawJobs.push({
        id: 'ashby-11223',
        title: 'Data Scientist',
        company: 'Ashby Corp',
        url: 'https://jobs.ashbyhq.com/example/11223',
        location: 'Remote',
        content: 'We need a data scientist familiar with Python and Machine Learning...',
      });
      
    } catch (error) {
      this.logger.error('Error during Ashby discovery', error);
    } finally {
      await browser.close();
    }

    return rawJobs;
  }

  async normalize(rawJobs: any[]): Promise<NormalizedJob[]> {
    return rawJobs.map(job => ({
      sourceId: job.id,
      title: job.title,
      companyName: job.company,
      description: job.content,
      url: job.url,
      postedAt: new Date(), 
      skills: [], 
    }));
  }
}
