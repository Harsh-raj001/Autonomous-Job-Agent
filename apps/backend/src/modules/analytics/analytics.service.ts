import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  async getUserDashboardMetrics(userId: string): Promise<any> {
    this.logger.log(`Fetching PM metrics for user ${userId}`);

    // 1. Total auto-applications
    const totalApplications = await prisma.application.count({
      where: { userId }
    });

    // 2. High Matches
    const highMatches = await prisma.resumeAnalysis.count({
      where: { userId, opportunityScore: 'High' }
    });

    // 3. Automation Activity (Jobs Discovered total)
    const jobsDiscoveredTotal = await prisma.job.count();

    // 4. Top Matches (Action Required)
    const topMatchesRaw = await prisma.resumeAnalysis.findMany({
      where: { 
        userId, 
        scoreTotal: { gte: 80 } 
      },
      include: {
        job: { include: { company: true } }
      },
      orderBy: { scoreTotal: 'desc' },
      take: 4
    });

    const topMatches = topMatchesRaw.map((m: any) => ({
      id: m.id,
      role: m.job.title,
      company: m.job.company.name,
      score: m.scoreTotal,
      opportunity: m.opportunityScore,
      probability: m.hiringProbability,
      competition: m.competitionLevel,
      action: m.recommendedAction,
      explanation: m.explanation,
      url: m.job.url
    }));

    // 5. Recent Activity (Simplified for now)
    const recentActivity = [
      { time: 'Just now', title: 'Dashboard Refreshed', desc: 'Loaded real-time metrics from Postgres.' }
    ];

    return {
      stats: {
        jobsDiscovered: jobsDiscoveredTotal,
        highMatches: highMatches,
        autoApplied: totalApplications
      },
      topMatches,
      recentActivity
    };
  }
}
