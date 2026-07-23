import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';

@Injectable()
export class NaukriProvider extends BaseJobProvider {
  readonly providerName = 'naukri';
  private readonly logger = new Logger(NaukriProvider.name);
  
  // Note: Naukri doesn't have a public open API. 
  // This uses a placeholder for a hypothetical RapidAPI or internal scraping microservice.
  private readonly API_URL = process.env.NAUKRI_API_URL || 'https://api.example.com/naukri/search';
  private readonly API_KEY = process.env.NAUKRI_API_KEY || '';

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    if (!this.API_KEY) {
      this.logger.warn('[Naukri] No API key configured. Skipping discovery.');
      return [];
    }

    this.logger.log(`[Naukri] Searching for: ${keywords.join(', ')}`);
    const allJobs: any[] = [];

    for (const keyword of keywords.slice(0, 3)) {
      try {
        const url = `${this.API_URL}?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`,
            'User-Agent': 'JobDiscoveryBot/1.0',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          this.logger.warn(`[Naukri] HTTP ${res.status} for keyword "${keyword}"`);
          continue;
        }

        const json = await res.json();
        const jobs = (json.jobs || []).slice(0, limit);
        this.logger.log(`[Naukri] Found ${jobs.length} jobs for "${keyword}"`);
        allJobs.push(...jobs);
      } catch (err: any) {
        this.logger.error(`[Naukri] Error fetching "${keyword}": ${err.message}`);
      }
    }

    return allJobs;
  }

  async normalize(rawJobs: any[]): Promise<NormalizedJob[]> {
    const seen = new Set<string>();
    const result: NormalizedJob[] = [];

    for (const job of rawJobs) {
      const jobUrl = job.jobUrl || job.url || '';
      if (!jobUrl || seen.has(jobUrl)) continue;
      seen.add(jobUrl);

      result.push({
        sourceId: `naukri-${job.jobId || job.id}`,
        title: job.title || 'Untitled',
        companyName: job.companyName || 'Unknown Company',
        description: (job.description || '').slice(0, 2000),
        url: jobUrl,
        postedAt: job.postedDate ? new Date(job.postedDate) : new Date(),
        skills: job.skills || [],
        location: job.location || 'Remote',
        jobType: job.employmentType || 'Full-time',
        salary: job.salary || null,
      });
    }

    return result;
  }
}
