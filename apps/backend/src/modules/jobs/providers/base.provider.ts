export interface NormalizedJob {
  sourceId: string;
  title: string;
  companyName: string;
  description: string;
  url: string;
  postedAt: Date;
  skills: string[];
  location?: string;
  jobType?: string;
  salary?: string | null;
}

export abstract class BaseJobProvider {
  /**
   * The name of the provider (e.g. 'greenhouse', 'linkedin')
   */
  abstract readonly providerName: string;

  /**
   * Discovers raw jobs from the target source.
   */
  abstract discoverJobs(keywords: string[], limit: number): Promise<any[]>;

  /**
   * Normalizes the raw jobs into our standard format.
   */
  abstract normalize(rawJobs: any[]): Promise<NormalizedJob[]>;

  /**
   * Deduplicates jobs that are already in our database based on URL or provider-specific ID.
   */
  async deduplicate(jobs: NormalizedJob[]): Promise<NormalizedJob[]> {
    // In a real implementation, this would query the DB for existing URLs.
    // Assuming Prisma is injected into the extending class or handled via a service.
    return jobs;
  }

  /**
   * Saves the normalized, deduplicated jobs to the database.
   */
  async save(jobs: NormalizedJob[]): Promise<void> {
    // Implement database saving logic here
  }

  /**
   * Orchestrates the entire discovery pipeline.
   */
  async runPipeline(keywords: string[], limit: number = 10): Promise<NormalizedJob[]> {
    const raw = await this.discoverJobs(keywords, limit);
    const normalized = await this.normalize(raw);
    const newJobs = await this.deduplicate(normalized);
    await this.save(newJobs);
    return newJobs;
  }
}
