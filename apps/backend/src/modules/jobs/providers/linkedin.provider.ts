import { Injectable } from '@nestjs/common';
import { NormalizedJob } from './base.provider';
import { ApifyBaseProvider } from './apify-base.provider';

@Injectable()
export class LinkedInProvider extends ApifyBaseProvider {
  readonly providerName = 'linkedin';
  
  protected readonly ACTOR_ID = process.env.APIFY_LINKEDIN_ACTOR_ID || 'rocky~linkedin-jobs-scraper';

  protected buildPayload(keyword: string, limit: number): Record<string, any> {
    return {
      keywords: keyword,
      location: "United States", // Can be made dynamic
      count: limit
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
        sourceId: `linkedin-${job.id || job.job_id || job.jobId || Math.random().toString()}`,
        title: job.title || job.position || 'Untitled',
        companyName: job.company?.name || job.companyName || job.company || 'Unknown Company',
        description: (job.description || job.jobDescription || '').slice(0, 2000),
        url: jobUrl,
        postedAt: job.postedAt || job.postedDate ? new Date(job.postedAt || job.postedDate) : new Date(),
        skills: job.skills || [],
        location: job.location || 'Remote',
        jobType: job.employmentType || job.employment_type || 'Full-time',
        salary: job.salary || null,
      });
    }

    return result;
  }
}
