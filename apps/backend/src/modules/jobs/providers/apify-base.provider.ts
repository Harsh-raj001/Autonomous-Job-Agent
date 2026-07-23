import { Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';

export abstract class ApifyBaseProvider extends BaseJobProvider {
  protected readonly logger = new Logger(this.constructor.name);
  
  protected readonly APIFY_TOKEN = process.env.APIFY_API_TOKEN || '';
  
  /**
   * The specific Apify Actor ID to use (e.g., 'bebity~indeed-scraper')
   */
  protected abstract readonly ACTOR_ID: string;

  /**
   * Builds the specific JSON payload expected by this Actor.
   */
  protected abstract buildPayload(keyword: string, limit: number): Record<string, any>;

  async discoverJobs(keywords: string[], limit: number): Promise<any[]> {
    if (!this.APIFY_TOKEN) {
      this.logger.warn(`[${this.providerName}] No Apify API token configured. Skipping discovery.`);
      return [];
    }

    this.logger.log(`[${this.providerName}] Searching for: ${keywords.join(', ')} via Apify Actor: ${this.ACTOR_ID}`);
    const allJobs: any[] = [];

    // Limit to the single most important keyword per run to drastically cut Apify credit usage
    for (const keyword of keywords.slice(0, 1)) {
      try {
        const url = `https://api.apify.com/v2/acts/${this.ACTOR_ID}/run-sync-get-dataset-items?token=${this.APIFY_TOKEN}`;
        const payload = this.buildPayload(keyword, limit);

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
          this.logger.warn(`[${this.providerName}] Apify HTTP ${res.status} for keyword "${keyword}": ${text}`);
          continue;
        }

        const jobs = await res.json();
        this.logger.log(`[${this.providerName}] Found ${jobs?.length || 0} jobs for "${keyword}"`);
        
        if (Array.isArray(jobs)) {
          allJobs.push(...jobs);
        }
      } catch (err: any) {
        this.logger.error(`[${this.providerName}] Error fetching "${keyword}" from Apify: ${err.message}`);
      }
    }

    return allJobs;
  }
}
