import { Injectable, Logger } from '@nestjs/common';
import { BaseJobProvider, NormalizedJob } from './base.provider';
import { GreenhouseProvider } from './greenhouse.provider';
import { LeverProvider } from './lever.provider';
import { AshbyProvider } from './ashby.provider';
import { RemotiveProvider } from './remotive.provider';
import { ArbeitNowProvider } from './arbeitnow.provider';
import { NaukriProvider } from './naukri.provider';
import { IndeedProvider } from './indeed.provider';
import { LinkedInProvider } from './linkedin.provider';
import { GlassdoorProvider } from './glassdoor.provider';
import { WellfoundProvider } from './wellfound.provider';
import { GoogleJobsProvider } from './google-jobs.provider';

@Injectable()
export class ProviderManager {
  private readonly logger = new Logger(ProviderManager.name);
  private providers: Map<string, BaseJobProvider> = new Map();

  constructor(
    private readonly greenhouseProvider: GreenhouseProvider,
    private readonly leverProvider: LeverProvider,
    private readonly ashbyProvider: AshbyProvider,
    private readonly remotiveProvider: RemotiveProvider,
    private readonly arbeitNowProvider: ArbeitNowProvider,
    private readonly naukriProvider: NaukriProvider,
    private readonly indeedProvider: IndeedProvider,
    private readonly linkedInProvider: LinkedInProvider,
    private readonly glassdoorProvider: GlassdoorProvider,
    private readonly wellfoundProvider: WellfoundProvider,
    private readonly googleJobsProvider: GoogleJobsProvider,
  ) {
    this.registerProvider(this.remotiveProvider);
    this.registerProvider(this.arbeitNowProvider);
    this.registerProvider(this.naukriProvider);
    this.registerProvider(this.indeedProvider);
    this.registerProvider(this.linkedInProvider);
    this.registerProvider(this.glassdoorProvider);
    this.registerProvider(this.wellfoundProvider);
    this.registerProvider(this.googleJobsProvider);
    this.registerProvider(this.greenhouseProvider);
    this.registerProvider(this.leverProvider);
    this.registerProvider(this.ashbyProvider);
  }

  private registerProvider(provider: BaseJobProvider) {
    this.providers.set(provider.providerName, provider);
    this.logger.log(`Registered job provider: ${provider.providerName}`);
  }

  /**
   * Run discovery across all registered providers simultaneously.
   */
  async runAllPipelines(keywords: string[], limitPerProvider: number = 15): Promise<NormalizedJob[]> {
    this.logger.log(`Running discovery pipeline across all providers for keywords: ${keywords.join(', ')}`);
    
    const results: NormalizedJob[] = [];
    const promises = Array.from(this.providers.values()).map(async (provider) => {
      try {
        const providerJobs = await provider.runPipeline(keywords, limitPerProvider);
        results.push(...providerJobs);
        this.logger.log(`Provider ${provider.providerName} returned ${providerJobs.length} new jobs.`);
      } catch (error) {
        this.logger.error(`Error running pipeline for provider ${provider.providerName}`, error);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }
}
