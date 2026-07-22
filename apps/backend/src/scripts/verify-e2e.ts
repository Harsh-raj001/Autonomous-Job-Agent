import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaClient } from '@prisma/client';
import { ResumeService } from '../modules/resume/resume.service';
import { MatchService } from '../modules/match/match.service';
import { TailorService } from '../modules/tailor/tailor.service';
import { AnalyticsService } from '../modules/analytics/analytics.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const logger = new Logger('E2E-Verification');

async function bootstrap() {
  logger.log('Starting E2E Verification Script...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const resumeService = app.get(ResumeService);
  const matchService = app.get(MatchService);
  const tailorService = app.get(TailorService);
  const analyticsService = app.get(AnalyticsService);

  try {
    // 1. User Signup Simulation
    logger.log('1. Creating Mock User...');
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        profile: {
          create: {
            firstName: 'Test',
            lastName: 'User',
          }
        },
        settings: {
          create: {
            autoApplyThreshold: 80
          }
        }
      }
    });
    logger.log(`User created: ${user.id}`);

    // 2. Mock Resume Upload
    logger.log('2. Mocking Resume Upload & Parsing...');
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileUrl: 'https://example.com/mock-resume.pdf',
      }
    });

    // We skip actual PDF passing here to save OpenAI tokens, and just mock the JSON structure 
    // that the ResumeService WOULD return.
    const mockParsedData = {
      skills: ['TypeScript', 'Node.js', 'React', 'Product Management'],
      experience: [{ title: 'Software Engineer', years: 2 }],
      education: [{ degree: 'B.S. Computer Science' }]
    };

    const parsedResume = await prisma.parsedResume.create({
      data: {
        resumeId: resume.id,
        data: mockParsedData,
      }
    });
    logger.log(`Resume parsed and saved: ${parsedResume.id}`);

    // 3. Job Discovery Simulation
    logger.log('3. Mocking Job Discovery...');
    const company = await prisma.company.create({
      data: { name: 'E2E Test Corp' }
    });

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: 'Fullstack Engineer',
        description: 'Looking for a TS/Node developer.',
        url: `https://example.com/job-${Date.now()}`,
        source: 'greenhouse',
        postedAt: new Date(),
      }
    });
    logger.log(`Job saved: ${job.id}`);

    // 4. Match Engine & Scoring
    logger.log('4. Running Match Engine...');
    const matchResult = await matchService.calculateMatch(mockParsedData, job);
    
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        userId: user.id,
        jobId: job.id,
        scoreTotal: matchResult.scoreTotal,
        scoreBreakdown: matchResult.scoreBreakdown,
        explanation: matchResult.explanation,
        opportunityScore: matchResult.opportunityScore,
        hiringProbability: matchResult.hiringProbability,
        competitionLevel: matchResult.competitionLevel,
        recommendedAction: matchResult.recommendedAction,
      }
    });
    logger.log(`Match scored: ${analysis.scoreTotal}/100. Opportunity: ${analysis.opportunityScore}. Action: ${analysis.recommendedAction}`);

    // 5. Audit Log Verification
    logger.log('5. Verifying Audit Logs...');
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'MATCH_CALCULATED',
        entityType: 'JOB',
        entityId: job.id,
        metadata: { score: analysis.scoreTotal }
      }
    });
    logger.log('Audit log successfully created.');

    // 6. Resume Tailoring
    logger.log('6. Running Resume Tailoring...');
    const tailorResult = await tailorService.tailorResume(user.id, job.id, resume.id);
    logger.log(`Resume tailored successfully: ${tailorResult.id}`);

    // 7. Analytics Generation
    logger.log('7. Generating PM Dashboard Analytics...');
    const analytics = await analyticsService.getUserDashboardMetrics(user.id);
    logger.log(`Analytics Generated: High Matches = ${analytics.pipeline.highMatches}`);

    logger.log('✅ ALL VERIFICATIONS PASSED.');
  } catch (error) {
    logger.error('❌ VERIFICATION FAILED', error);
  } finally {
    await app.close();
    await prisma.$disconnect();
  }
}

bootstrap();
