import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';
import { DiscoveryScheduler } from './discovery.scheduler';
import { prisma } from '../../prisma.singleton';

@Controller('jobs')
export class JobsController {
  constructor(private readonly discoveryScheduler: DiscoveryScheduler) {}

  @Post('discover')
  @UseGuards(SupabaseAuthGuard)
  async discoverJobs(@Req() req: any) {
    const userId = req.user.id;
    // Fire discovery in background — returns immediately with a confirmation
    const result = await this.discoveryScheduler.discoverAndStoreJobs(userId);
    return {
      message: `Job discovery complete! Found ${result.total} jobs, inserted ${result.inserted} new ones.`,
      keywords: result.keywords,
      inserted: result.inserted,
      total: result.total,
    };
  }

  @Get('search')
  @UseGuards(SupabaseAuthGuard)
  async searchJobs(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('query') query: string = '',
    @Query('sort') sort: string = 'newest', // newest, best_match
  ) {
    const userId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // If sorting by best_match, we need to join ResumeAnalysis
    let orderBy: any = { postedAt: 'desc' };
    
    // We construct the base where clause
    let where: any = { status: 'OPEN' };
    
    if (query) {
      where = {
        ...where,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { company: { name: { contains: query, mode: 'insensitive' } } }
        ]
      };
    }

    if (sort === 'best_match') {
      // Prisma doesn't directly support sorting by a deeply nested relation field dynamically if it's a 1-to-many 
      // but Job -> ResumeAnalysis is 1-to-many, although it's unique per (jobId, userId).
      // We will fetch jobs, include the analysis for this user, and sort in memory if best_match is selected.
      // For production at scale, a raw SQL query or materialized view is better.
      const jobs = await prisma.job.findMany({
        where,
        include: {
          company: true,
          analyses: {
            where: { userId }
          }
        },
        take: 200, // Fetch more to sort in memory
      });

      const sorted = jobs.sort((a: any, b: any) => {
        const scoreA = a.analyses[0]?.scoreTotal || 0;
        const scoreB = b.analyses[0]?.scoreTotal || 0;
        return scoreB - scoreA;
      });

      const paginated = sorted.slice(skip, skip + take);

      return {
        data: paginated,
        meta: {
          total: jobs.length,
          page: parseInt(page),
          limit: take,
        }
      };
    } else {
      // Default: sort by newest (postedAt desc)
      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            company: true,
            analyses: {
              where: { userId }
            }
          },
          orderBy,
          skip,
          take,
        }),
        prisma.job.count({ where })
      ]);

      return {
        data: jobs,
        meta: {
          total,
          page: parseInt(page),
          limit: take,
        }
      };
    }
  }

  @Get('review-queue')
  @UseGuards(SupabaseAuthGuard)
  async getReviewQueue(@Req() req: any) {
    const userId = req.user.id;
    
    // Fetch user settings to get autoApplyThreshold (default 80 if not set)
    const settings = await prisma.settings.findUnique({ where: { userId } });
    const threshold = settings?.autoApplyThreshold || 80;

    const jobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
        analyses: {
          some: {
            userId,
            scoreTotal: { lt: threshold, gt: 40 } // Below auto-apply but still decent
          }
        }
      },
      include: {
        company: true,
        analyses: {
          where: { userId }
        }
      },
      orderBy: { postedAt: 'desc' },
      take: 50
    });

    return { data: jobs };
  }
}
