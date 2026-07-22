import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Example: Run daily at 9:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyDigests() {
    this.logger.log('Executing CRON: sendDailyDigests');
    
    // In production, we'd query all users who have notifications enabled
    const users = await prisma.user.findMany({
      include: {
        settings: true
      }
    });

    for (const user of users) {
      if (user.settings?.autoApplyThreshold) {
        this.logger.log(`Compiling daily digest for user ${user.id}...`);
        
        // Find high opportunity matches from the last 24h
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentMatches = await prisma.resumeAnalysis.findMany({
          where: {
            userId: user.id,
            createdAt: { gte: yesterday },
            opportunityScore: 'High'
          },
          include: { job: true }
        });

        if (recentMatches.length > 0) {
          this.logger.log(`Would email ${user.email} about ${recentMatches.length} high-opportunity jobs.`);
          // e.g. await sendGrid.send({...})
        }
      }
    }
  }

  // Example: Run every Monday at 10:00 AM
  @Cron(CronExpression.EVERY_WEEK)
  async sendWeeklyAnalyticsReport() {
    this.logger.log('Executing CRON: sendWeeklyAnalyticsReport');
    // Aggregate analytics (conversion rates) and email the user
  }
}
