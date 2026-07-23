import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';

@Injectable()
export class IndeedProvider extends BaseJobProvider {
  readonly providerName = 'indeed';
  private readonly logger = new Logger(IndeedProvider.name);
  
  private readonly APIFY_TOKEN = process.env.APIFY_API_TOKEN || '';
  private readonly ACTOR_ID = process.env.APIFY_INDEED_ACTOR_ID || 'bebity~indeed-scraper'; // Default public actor

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    if (!this.APIFY_TOKEN) {
      this.logger.warn('[Indeed] No Apify API token configured. Skipping discovery.');
      return [];
    }

    this.logger.log(`[Indeed] Searching for: ${keywords.join(', ')} via Apify Actor: ${this.ACTOR_ID}`);
    const allJobs: any[] = [];

    for (const keyword of keywords.slice(0, 3)) {
      try {
        const url = `https://api.apify.com/v2/acts/${this.ACTOR_ID}/run-sync-get-dataset-items?token=${this.APIFY_TOKEN}`;
        
        const payload = {
          position: keyword,
          country: "US", // Can be made dynamic
          maxItems: limit
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          // Set a long timeout since Apify synchronous runs can take up to 5 minutes
          signal: AbortSignal.timeout(300000), 
        });

        if (!res.ok) {
          const text = await res.text();
          this.logger.warn(`[Indeed] Apify HTTP ${res.status} for keyword "${keyword}": ${text}`);
          continue;
        }

        const jobs = await res.json();
        this.logger.log(`[Indeed] Found ${jobs?.length || 0} jobs for "${keyword}"`);
        if (Array.isArray(jobs)) {
          allJobs.push(...jobs);
        }
      } catch (err: any) {
        this.logger.error(`[Indeed] Error fetching "${keyword}" from Apify: ${err.message}`);
      }
    }

    return allJobs;
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
