import { Injectable } from '@nestjs/common';
import { NormalizedJob } from './base.provider';
import { ApifyBaseProvider } from './apify-base.provider';

@Injectable()
export class IndeedProvider extends ApifyBaseProvider {
  readonly providerName = 'indeed';
  
  protected readonly ACTOR_ID = process.env.APIFY_INDEED_ACTOR_ID || 'valig~indeed-jobs-scraper';

  protected buildPayload(keyword: string, limit: number): Record<string, any> {
    return {
      position: keyword,
      query: keyword, // fallback
      keyword: keyword, // fallback
      country: "US",
      location: "US", // fallback
      maxItems: limit
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
        sourceId: `indeed-${job.id || job.jobKey || job.jobkey || Math.random().toString()}`,
        title: job.title || job.jobTitle || 'Untitled',
        companyName: job.company || job.companyName || 'Unknown Company',
        description: (job.description || job.snippet || '').slice(0, 2000),
        url: jobUrl,
        postedAt: job.postedAt || job.date ? new Date(job.postedAt || job.date) : new Date(),
        skills: job.skills || [],
        location: job.location || job.formattedLocation || 'Remote',
        jobType: job.jobType || job.employmentType || 'Full-time',
        salary: job.salary || null,
      });
    }

    return result;
  }
}
