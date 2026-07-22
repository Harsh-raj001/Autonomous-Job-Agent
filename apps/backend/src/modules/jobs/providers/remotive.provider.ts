import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';

@Injectable()
export class RemotiveProvider extends BaseJobProvider {
  readonly providerName = 'remotive';
  private readonly logger = new Logger(RemotiveProvider.name);
  private readonly BASE_URL = 'https://remotive.com/api/remote-jobs';

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    this.logger.log(`[Remotive] Searching for: ${keywords.join(', ')}`);
    const allJobs: any[] = [];

    for (const keyword of keywords) {
      try {
        const url = `${this.BASE_URL}?search=${encodeURIComponent(keyword)}&limit=${limit}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'JobDiscoveryBot/1.0' },
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          this.logger.warn(`[Remotive] HTTP ${res.status} for keyword "${keyword}"`);
          continue;
        }

        const json = await res.json();
        const jobs = json.jobs || [];
        this.logger.log(`[Remotive] Found ${jobs.length} jobs for "${keyword}"`);
        allJobs.push(...jobs);
      } catch (err: any) {
        this.logger.error(`[Remotive] Error fetching "${keyword}": ${err.message}`);
      }
    }

    return allJobs;
  }

  async normalize(rawJobs: any[]): Promise<NormalizedJob[]> {
    // Deduplicate by job_type + title + company within the provider response
    const seen = new Set<string>();
    const result: NormalizedJob[] = [];

    for (const job of rawJobs) {
      const key = job.url;
      if (seen.has(key)) continue;
      seen.add(key);

      result.push({
        sourceId: `remotive-${job.id}`,
        title: job.title || 'Untitled',
        companyName: job.company_name || 'Unknown Company',
        description: this.stripHtml(job.description || '').slice(0, 2000),
        url: job.url || '',
        postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
        skills: this.extractSkills(job.tags || [], job.candidate_required_location || ''),
        location: job.candidate_required_location || 'Remote',
        jobType: job.job_type || 'full_time',
        salary: job.salary || null,
      });
    }

    return result;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractSkills(tags: string[], location: string): string[] {
    const skills: string[] = [...tags];
    if (location) skills.push(location);
    return skills.filter(Boolean).slice(0, 10);
  }
}
