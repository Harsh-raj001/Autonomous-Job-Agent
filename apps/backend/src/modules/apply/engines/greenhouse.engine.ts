import { Injectable, Logger } from '@nestjs/common';
import { BaseApplyEngine } from './base.engine';
import { Page } from 'playwright';

@Injectable()
export class GreenhouseApplyEngine extends BaseApplyEngine {
  readonly engineName = 'greenhouse';
  private readonly logger = new Logger(GreenhouseApplyEngine.name);

  async fillForm(page: Page, data: any): Promise<boolean> {
    this.logger.log('Executing Greenhouse-specific apply logic...');
    try {
      await page.fill('input[name="first_name"]', data.firstName || 'Candidate');
      await page.fill('input[name="last_name"]', data.lastName || 'Test');
      await page.fill('input[name="email"]', data.email || 'test@example.com');
      await page.fill('input[name="phone"]', data.phone || '1234567890');

      if (data.resumePath) {
        await page.setInputFiles('input[type="file"][name="resume"]', data.resumePath);
      }

      if (process.env.DRY_RUN === 'false') {
        this.logger.log('Executing live application submission...');
        await page.click('button[id="submit_app"]'); 
      } else {
        this.logger.log('Form filled successfully. (DRY_RUN enabled, skipping submission)');
      }

      return true;
    } catch (error) {
      this.logger.error('Error filling Greenhouse form', error);
      return false;
    }
  }
}
