import { Injectable, Logger } from '@nestjs/common';
import { BaseApplyEngine } from './base.engine';
import { Page } from 'playwright';

@Injectable()
export class AshbyApplyEngine extends BaseApplyEngine {
  readonly engineName = 'ashby';
  private readonly logger = new Logger(AshbyApplyEngine.name);

  async fillForm(page: Page, data: any): Promise<boolean> {
    this.logger.log('Executing Ashby-specific apply logic...');
    try {
      // Ashby specific selectors
      await page.fill('input[name="name"]', `${data.firstName || ''} ${data.lastName || ''}`.trim());
      await page.fill('input[name="email"]', data.email || 'test@example.com');
      
      if (process.env.DRY_RUN === 'false') {
        this.logger.log('Executing live application submission...');
        await page.click('button[type="submit"]'); // Example selector for Ashby
      } else {
        this.logger.log('Form filled successfully. (DRY_RUN enabled, skipping submission)');
      }

      return true;
    } catch (error) {
      this.logger.error('Error filling Ashby form', error);
      return false;
    }
  }
}
