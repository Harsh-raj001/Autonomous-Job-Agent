import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';

@Injectable()
export class LeverProvider extends BaseJobProvider {
  readonly providerName = 'lever';
  private readonly logger = new Logger(LeverProvider.name);

  // Focus on top Indian tech giants using Lever
  private readonly companyIds = ['cred'];

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    this.logger.log(`[Lever] Discovering real Indian jobs for keywords: ${keywords.join(', ')}`);
    const matches: any[] = [];
    const lowerKeywords = keywords.map(kw => kw.toLowerCase());

    for (const company of this.companyIds) {
      try {
        const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) continue;

        const jobs = await res.json();
        if (!Array.isArray(jobs)) continue;

        for (const job of jobs) {
          const locName = (job.categories?.location || '').toLowerCase();
          
          // Filter for jobs located in India, Bangalore, Pune, Gurgaon, etc.
          const isIndia = 
            locName.includes('india') || 
            locName.includes('bangalore') || 
            locName.includes('bengaluru') || 
            locName.includes('pune') || 
            locName.includes('gurgaon') || 
            locName.includes('gurugram') || 
            locName.includes('noida') || 
            locName.includes('mumbai') || 
            locName.includes('hyderabad') || 
            locName.includes('chennai') ||
            locName.includes('remote'); // Lever remote categories can be global

          if (!isIndia) continue;

          // Perform keyword matching on title and description/content
          const title = (job.title || '').toLowerCase();
          const content = (job.description || '').toLowerCase();
          
          const matchesKeyword = lowerKeywords.length === 0 || lowerKeywords.some(kw => 
            title.includes(kw) || content.includes(kw)
          );

          if (matchesKeyword) {
            matches.push({
              id: `lever-${company}-${job.id}`,
              title: job.title,
              company: 'CRED',
              url: job.hostedUrl,
              location: job.categories?.location || 'India',
              content: job.description || '',
            });
          }
        }
      } catch (err: any) {
        this.logger.error(`[Lever] Error fetching postings for "${company}": ${err.message}`);
      }
    }

    this.logger.log(`[Lever] Found ${matches.length} matching Indian jobs`);
    return matches.slice(0, limit);
  }

  async normalize(rawJobs: any[]): Promise<NormalizedJob[]> {
    return rawJobs.map(job => ({
      sourceId: job.id,
      title: job.title,
      companyName: job.company,
      description: this.stripHtml(job.content).slice(0, 3000),
      url: job.url,
      postedAt: new Date(),
      skills: [],
    }));
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
}
