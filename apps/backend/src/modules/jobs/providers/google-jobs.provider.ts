import { Injectable } from '@nestjs/common';
import { NormalizedJob } from './base.provider';
import { ApifyBaseProvider } from './apify-base.provider';

@Injectable()
export class GoogleJobsProvider extends ApifyBaseProvider {
  readonly providerName = 'google-jobs';
  
  protected readonly ACTOR_ID = process.env.APIFY_GOOGLE_JOBS_ACTOR_ID || 'apify~google-jobs-scraper';

  protected buildPayload(keyword: string, limit: number): Record<string, any> {
    return {
      searchQuery: keyword,
      country: "US", 
      maxItems: limit
    };
  }

  async normalize(rawJobs: any[]): Promise<NormalizedJob[]> {
    const seen = new Set<string>();
    const result: NormalizedJob[] = [];

    for (const job of rawJobs) {
      const jobUrl = job.url || job.applyLink || '';
      if (!jobUrl || seen.has(jobUrl)) continue;
      seen.add(jobUrl);

      result.push({
        sourceId: `google-jobs-${job.id || job.jobId || Math.random().toString()}`,
        title: job.title || job.jobTitle || 'Untitled',
        companyName: job.company || job.companyName || 'Unknown Company',
        description: (job.description || job.snippet || '').slice(0, 2000),
        url: jobUrl,
        postedAt: job.postedAt || job.date ? new Date(job.postedAt || job.date) : new Date(),
        skills: job.skills || [],
        location: job.location || job.jobLocation || 'Remote',
        jobType: job.jobType || job.employmentType || 'Full-time',
        salary: job.salary || null,
      });
    }

    return result;
  }
}
