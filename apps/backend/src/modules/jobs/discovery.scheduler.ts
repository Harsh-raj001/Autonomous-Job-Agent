import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProviderManager } from './providers/provider-manager.service';
import { KeywordExtractorService } from './keyword-extractor.service';
import { prisma } from '../../prisma.singleton';
import { MatchService } from '../match/match.service';

@Injectable()
export class DiscoveryScheduler {
  private readonly logger = new Logger(DiscoveryScheduler.name);

  constructor(
    private readonly providerManager: ProviderManager,
    private readonly matchService: MatchService,
    private readonly keywordExtractor: KeywordExtractorService,
  ) {}

  // Run every 6 hours
  @Cron('0 */6 * * *')
  async handleCron() {
    this.logger.log('Running scheduled job discovery (6-hour interval)');
    await this.discoverAndStoreJobs();
  }

  /**
   * Main discovery pipeline. If userId provided, uses that user's resume for keywords.
   * Otherwise, runs for ALL users with active parsed resumes.
   */
  async discoverAndStoreJobs(userId?: string): Promise<{ inserted: number; total: number; keywords: string[] }> {
    this.logger.log('Starting job discovery pipeline...');

    let keywords: string[] = [];

    if (userId) {
      // Personalized: find this user's latest active parsed resume
      keywords = await this.getKeywordsForUser(userId);
    } else {
      // Scheduled: aggregate keywords from all active users
      keywords = await this.getAggregatedKeywords();
    }

    this.logger.log(`Discovery using keywords: ${keywords.join(', ')}`);

    const discoveredJobs = await this.providerManager.runAllPipelines(keywords, 20);
    this.logger.log(`Discovery complete. Found ${discoveredJobs.length} total jobs. Saving new ones...`);

    let newJobsInserted = 0;

    for (const job of discoveredJobs) {
      if (!job.url) continue;
      
      try {
        // Find or create Company
        let company = await prisma.company.findFirst({
          where: { name: job.companyName }
        });

        if (!company) {
          company = await prisma.company.create({
            data: { name: job.companyName }
          });
        }

        // Duplicate detection: upsert on unique URL
        const existing = await prisma.job.findUnique({ where: { url: job.url } });

        if (!existing) {
          const newDbJob = await prisma.job.create({
            data: {
              companyId: company.id,
              title: job.title,
              description: job.description,
              url: job.url,
              source: job.sourceId,
              postedAt: job.postedAt || new Date(),
              status: 'OPEN',
            }
          });
          newJobsInserted++;

          // Hook into Match Engine for personalized scoring
          if (userId) {
            await this.matchService.evaluateNewJob(newDbJob.id);
          }
        }
      } catch (error: any) {
        this.logger.error(`Failed to process job "${job.title}" at "${job.companyName}": ${error.message}`);
      }
    }

    this.logger.log(`Inserted ${newJobsInserted} new unique jobs out of ${discoveredJobs.length} discovered.`);
    return { inserted: newJobsInserted, total: discoveredJobs.length, keywords };
  }

  /**
   * Build keywords from a specific user's parsed resume.
   */
  async getKeywordsForUser(userId: string): Promise<string[]> {
    try {
      const resume = await prisma.resume.findFirst({
        where: { userId, isActive: true },
        include: { parsedResume: true },
        orderBy: { createdAt: 'desc' },
      });

      if (resume?.parsedResume?.data) {
        return this.keywordExtractor.extractKeywords(resume.parsedResume.data as any);
      }
    } catch (err: any) {
      this.logger.error(`Failed to get resume for user ${userId}: ${err.message}`);
    }

    return this.keywordExtractor.extractKeywords(null);
  }

  /**
   * Aggregate keywords from all users' active resumes (for scheduled runs).
   */
  private async getAggregatedKeywords(): Promise<string[]> {
    try {
      const resumes = await prisma.resume.findMany({
        where: { isActive: true },
        include: { parsedResume: true },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      });

      const allKeywords = new Set<string>();
      for (const resume of resumes) {
        if (resume.parsedResume?.data) {
          const kw = this.keywordExtractor.extractKeywords(resume.parsedResume.data as any);
          kw.forEach(k => allKeywords.add(k));
        }
      }

      if (allKeywords.size > 0) {
        return Array.from(allKeywords).slice(0, 10);
      }
    } catch (err: any) {
      this.logger.error(`Failed to aggregate keywords: ${err.message}`);
    }

    return this.keywordExtractor.extractKeywords(null);
  }
}
