import { Injectable, Logger } from '@nestjs/common';
import { BaseApplyEngine } from './base.engine';
import { Page } from 'playwright';

@Injectable()
export class LeverApplyEngine extends BaseApplyEngine {
  readonly engineName = 'lever';
  private readonly logger = new Logger(LeverApplyEngine.name);

  async fillForm(page: Page, data: any): Promise<boolean> {
    this.logger.log('Executing Lever-specific apply logic...');
    try {
      // Lever uses different selectors, e.g., name="name", name="email"
      await page.fill('input[name="name"]', `${data.firstName || ''} ${data.lastName || ''}`.trim());
      await page.fill('input[name="email"]', data.email || 'test@example.com');
      
      if (process.env.DRY_RUN === 'false') {
        this.logger.log('Executing live application submission...');
        await page.click('button[data-qa="btn-submit"]'); // Example selector for Lever
      } else {
        this.logger.log('Form filled successfully. (DRY_RUN enabled, skipping submission)');
      }

      return true;
    } catch (error) {
      this.logger.error('Error filling Lever form', error);
      return false;
    }
  }
}
