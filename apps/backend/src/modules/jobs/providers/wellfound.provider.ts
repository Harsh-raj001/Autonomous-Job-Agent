import { Injectable } from '@nestjs/common';
import { NormalizedJob } from './base.provider';
import { ApifyBaseProvider } from './apify-base.provider';

@Injectable()
export class WellfoundProvider extends ApifyBaseProvider {
  readonly providerName = 'wellfound';
  
  protected readonly ACTOR_ID = process.env.APIFY_WELLFOUND_ACTOR_ID || 'radeance~wellfound-job-listings-scraper';

  protected buildPayload(keyword: string, limit: number): Record<string, any> {
    return {
      searchQuery: keyword,
      keyword: keyword, // fallback
      query: keyword, // fallback
      maxItems: limit,
      limit: limit // fallback
    };
  }

  async normalize(rawJobs: any[]): Promise<NormalizedJob[]> {
    const seen = new Set<string>();
    const result: NormalizedJob[] = [];

    for (const job of rawJobs) {
      const jobUrl = job.url || job.jobUrl || '';
      if (!jobUrl || seen.has(jobUrl)) continue;
      seen.add(jobUrl);

      result.push({
        sourceId: `wellfound-${job.id || job.jobId || Math.random().toString()}`,
        title: job.title || job.jobTitle || 'Untitled',
        companyName: job.company || job.startupName || job.companyName || 'Unknown Company',
        description: (job.description || job.jobDescription || '').slice(0, 2000),
        url: jobUrl,
        postedAt: job.postedAt || job.date ? new Date(job.postedAt || job.date) : new Date(),
        skills: job.skills || job.tags || [],
        location: job.location || job.jobLocation || 'Remote',
        jobType: job.jobType || job.employmentType || 'Full-time',
        salary: job.salary || job.compensation || null,
      });
    }

    return result;
  }
}
