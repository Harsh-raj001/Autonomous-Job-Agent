import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';

@Injectable()
export class ArbeitNowProvider extends BaseJobProvider {
  readonly providerName = 'arbeitnow';
  private readonly logger = new Logger(ArbeitNowProvider.name);
  private readonly BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    this.logger.log(`[ArbeitNow] Searching for: ${keywords.join(', ')}`);
    const allJobs: any[] = [];

    // ArbeitNow uses free-text search via ?search param, paginated
    for (const keyword of keywords.slice(0, 3)) { // limit to 3 keywords to avoid hammering
      try {
        const url = `${this.BASE_URL}?search=${encodeURIComponent(keyword)}&page=1`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'JobDiscoveryBot/1.0',
          },
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          this.logger.warn(`[ArbeitNow] HTTP ${res.status} for keyword "${keyword}"`);
          continue;
        }

        const json = await res.json();
        const jobs = (json.data || []).slice(0, limit);
        this.logger.log(`[ArbeitNow] Found ${jobs.length} jobs for "${keyword}"`);
        allJobs.push(...jobs);
      } catch (err: any) {
        this.logger.error(`[ArbeitNow] Error fetching "${keyword}": ${err.message}`);
      }
    }

    return allJobs;
  }

  async normalize(rawJobs: any[]): Promise<NormalizedJob[]> {
    const seen = new Set<string>();
    const result: NormalizedJob[] = [];

    for (const job of rawJobs) {
      const jobUrl = job.url || '';
      if (!jobUrl || seen.has(jobUrl)) continue;
      seen.add(jobUrl);

      result.push({
        sourceId: `arbeitnow-${job.slug || jobUrl}`,
        title: job.title || 'Untitled',
        companyName: job.company_name || 'Unknown Company',
        description: (job.description || '').slice(0, 2000),
        url: jobUrl,
        postedAt: job.created_at ? new Date(job.created_at * 1000) : new Date(),
        skills: job.tags || [],
        location: job.location || 'Remote',
        jobType: job.job_types?.join(', ') || 'Full-time',
        salary: null,
      });
    }

    return result;
  }
}
