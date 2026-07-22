import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SupabaseAuthGuard } from '../../auth/supabase.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(SupabaseAuthGuard)
  async getDashboard(@Req() req: any) {
    const userId = req.user.id;
    return this.analyticsService.getUserDashboardMetrics(userId);
  }
}
