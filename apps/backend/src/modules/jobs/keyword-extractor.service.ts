import { Injectable, Logger } from '@nestjs/common';

/**
 * Maps domain expertise extracted from a resume to a curated list of
 * search keywords for job discovery.
 */
@Injectable()
export class KeywordExtractorService {
  private readonly logger = new Logger(KeywordExtractorService.name);

  // Role-family keyword mappings
  private readonly ROLE_KEYWORDS: Record<string, string[]> = {
    'product manager': [
      'Product Manager', 'Senior Product Manager', 'Associate Product Manager',
      'APM', 'Product Lead', 'Product Owner',
    ],
    'project manager': [
      'Project Manager', 'Senior Project Manager', 'Associate Project Manager',
      'Program Manager', 'Technical Project Manager', 'IT Project Manager',
    ],
    'program manager': [
      'Program Manager', 'Associate Program Manager', 'Technical Program Manager',
      'Project Manager', 'Senior Program Manager',
    ],
    'business analyst': [
      'Business Analyst', 'Senior Business Analyst', 'Associate Business Analyst',
      'BA', 'Business Systems Analyst', 'Requirements Analyst',
    ],
    'data analyst': [
      'Data Analyst', 'Senior Data Analyst', 'Business Intelligence Analyst',
      'BI Analyst', 'Analytics Analyst', 'Reporting Analyst',
    ],
    'financial analyst': [
      'Financial Analyst', 'Senior Financial Analyst', 'Finance Analyst',
      'FP&A Analyst', 'Investment Analyst', 'Associate Financial Analyst',
    ],
    'financial modeling': [
      'Financial Analyst', 'FP&A Analyst', 'Corporate Finance Analyst',
      'Investment Banking Analyst', 'Valuation Analyst', 'Financial Modeler',
    ],
    'marketing': [
      'Marketing Manager', 'Digital Marketing Manager', 'Marketing Analyst',
      'Growth Marketing Manager', 'Product Marketing Manager', 'Brand Manager',
      'Marketing Coordinator', 'Content Marketing Manager',
    ],
    'software engineer': [
      'Software Engineer', 'Full Stack Developer', 'Backend Engineer',
      'Frontend Developer', 'Software Developer',
    ],
    'data science': [
      'Data Scientist', 'Machine Learning Engineer', 'ML Engineer',
      'AI Engineer', 'Data Science Analyst',
    ],
    'ux': [
      'UX Designer', 'Product Designer', 'UX Researcher', 'UI/UX Designer',
    ],
    'operations': [
      'Operations Manager', 'Operations Analyst', 'Business Operations',
      'Strategy & Operations',
    ],
    'consulting': [
      'Strategy Consultant', 'Management Consultant', 'Business Consultant',
      'Associate Consultant',
    ],
    'sales': [
      'Account Executive', 'Sales Manager', 'Business Development Manager',
      'Sales Representative', 'Enterprise Account Executive',
    ],
  };

  /**
   * Given a structured parsed resume JSON, extract the most relevant job search keywords.
   */
  extractKeywords(parsedResumeData: any): string[] {
    if (!parsedResumeData) {
      this.logger.warn('No parsed resume data provided, using defaults');
      return this.getDefaultKeywords();
    }

    const keywords = new Set<string>();

    // 1. Match against experience job titles
    const experienceTitles: string[] = [];
    if (Array.isArray(parsedResumeData.experience)) {
      for (const exp of parsedResumeData.experience) {
        if (exp.title) experienceTitles.push(exp.title.toLowerCase());
      }
    }

    // 2. Match against domain expertise
    const domains: string[] = [];
    if (Array.isArray(parsedResumeData.domainExpertise)) {
      domains.push(...parsedResumeData.domainExpertise.map((d: string) => d.toLowerCase()));
    }

    // 3. Match against skills/tools/frameworks
    const skills: string[] = [];
    if (Array.isArray(parsedResumeData.tools)) skills.push(...parsedResumeData.tools.map((s: string) => s.toLowerCase()));
    if (Array.isArray(parsedResumeData.frameworks)) skills.push(...parsedResumeData.frameworks.map((s: string) => s.toLowerCase()));

    const allSignals = [...experienceTitles, ...domains, ...skills];

    for (const signal of allSignals) {
      for (const [roleKey, roleKeywords] of Object.entries(this.ROLE_KEYWORDS)) {
        if (signal.includes(roleKey) || roleKey.split(' ').some(word => signal.includes(word))) {
          roleKeywords.forEach(kw => keywords.add(kw));
        }
      }
    }

    // 4. Fallback: if nothing matched, check for partial keyword matches in titles
    if (keywords.size === 0) {
      for (const title of experienceTitles) {
        if (title.includes('product')) {
          this.ROLE_KEYWORDS['product manager'].forEach(kw => keywords.add(kw));
        }
        if (title.includes('project') || title.includes('program')) {
          this.ROLE_KEYWORDS['project manager'].forEach(kw => keywords.add(kw));
        }
        if (title.includes('analys') || title.includes('data')) {
          this.ROLE_KEYWORDS['data analyst'].forEach(kw => keywords.add(kw));
        }
        if (title.includes('finance') || title.includes('financial')) {
          this.ROLE_KEYWORDS['financial analyst'].forEach(kw => keywords.add(kw));
        }
        if (title.includes('market')) {
          this.ROLE_KEYWORDS['marketing'].forEach(kw => keywords.add(kw));
        }
        if (title.includes('engineer') || title.includes('developer') || title.includes('software')) {
          this.ROLE_KEYWORDS['software engineer'].forEach(kw => keywords.add(kw));
        }
      }
    }

    // 5. Ultimate fallback: default set for PM/BA/Analyst roles
    if (keywords.size === 0) {
      this.logger.log('Could not detect role from resume, using default PM/Analyst keywords');
      return this.getDefaultKeywords();
    }

    const result = Array.from(keywords).slice(0, 8); // Cap at 8 unique keywords for API efficiency
    this.logger.log(`Extracted ${result.length} keywords from resume: ${result.join(', ')}`);
    return result;
  }

  private getDefaultKeywords(): string[] {
    return [
      'Product Manager',
      'Associate Product Manager',
      'Business Analyst',
      'Data Analyst',
      'Project Manager',
      'Financial Analyst',
    ];
  }
}
