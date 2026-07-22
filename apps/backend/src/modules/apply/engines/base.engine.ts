import { Page } from 'playwright';

export abstract class BaseApplyEngine {
  /**
   * The name of the ATS (e.g. 'greenhouse', 'lever')
   */
  abstract readonly engineName: string;

  /**
   * Fills the ATS specific form logic.
   * @param page Playwright Page object already navigated to the job URL
   * @param candidateData Normalized parsed resume data
   */
  abstract fillForm(page: Page, candidateData: any): Promise<boolean>;
}
