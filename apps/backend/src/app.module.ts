import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResumeModule } from './modules/resume/resume.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MatchModule } from './modules/match/match.module';
import { ApplyModule } from './modules/apply/apply.module';
import { TailorModule } from './modules/tailor/tailor.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ResumeModule,
    JobsModule,
    MatchModule,
    ApplyModule,
    TailorModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
