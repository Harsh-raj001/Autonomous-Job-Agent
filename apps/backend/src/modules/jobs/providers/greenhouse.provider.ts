import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';

@Injectable()
export class GreenhouseProvider extends BaseJobProvider {
  readonly providerName = 'greenhouse';
  private readonly logger = new Logger(GreenhouseProvider.name);

  // Focus on top Indian tech giants using Greenhouse
  private readonly boardTokens = ['phonepe', 'inmobi'];

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    this.logger.log(`[Greenhouse] Discovering real Indian jobs for keywords: ${keywords.join(', ')}`);
    const matches: any[] = [];
    const lowerKeywords = keywords.map(kw => kw.toLowerCase());

    for (const board of this.boardTokens) {
      try {
        const url = `https://api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) continue;

        const data = await res.json();
        const jobs = data.jobs || [];

        for (const job of jobs) {
          const locName = (job.location?.name || '').toLowerCase();
          
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
            locName.includes('chennai');

          if (!isIndia) continue;

          // Perform keyword matching on title and description/content
          const title = (job.title || '').toLowerCase();
          const content = (job.content || '').toLowerCase();
          
          const matchesKeyword = lowerKeywords.length === 0 || lowerKeywords.some(kw => 
            title.includes(kw) || content.includes(kw)
          );

          if (matchesKeyword) {
            matches.push({
              id: `greenhouse-${board}-${job.id}`,
              title: job.title,
              company: board === 'phonepe' ? 'PhonePe' : 'InMobi',
              url: job.absolute_url,
              location: job.location?.name || 'India',
              content: job.content || '',
            });
          }
        }
      } catch (err: any) {
        this.logger.error(`[Greenhouse] Error fetching board "${board}": ${err.message}`);
      }
    }

    this.logger.log(`[Greenhouse] Found ${matches.length} matching Indian jobs`);
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
