import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ProviderManager } from './providers/provider-manager.service';
import { GreenhouseProvider } from './providers/greenhouse.provider';
import { LeverProvider } from './providers/lever.provider';
import { AshbyProvider } from './providers/ashby.provider';
import { RemotiveProvider } from './providers/remotive.provider';
import { ArbeitNowProvider } from './providers/arbeitnow.provider';
import { NaukriProvider } from './providers/naukri.provider';
import { IndeedProvider } from './providers/indeed.provider';
import { LinkedInProvider } from './providers/linkedin.provider';
import { DiscoveryScheduler } from './discovery.scheduler';
import { KeywordExtractorService } from './keyword-extractor.service';
import { MatchModule } from '../match/match.module';
import { JobsController } from './jobs.controller';

@Module({
  imports: [ScheduleModule.forRoot(), MatchModule],
  controllers: [JobsController],
  providers: [
    ProviderManager,
    GreenhouseProvider,
    LeverProvider,
    AshbyProvider,
    RemotiveProvider,
    ArbeitNowProvider,
    NaukriProvider,
    IndeedProvider,
    LinkedInProvider,
    KeywordExtractorService,
    DiscoveryScheduler,
  ],
  exports: [ProviderManager, KeywordExtractorService],
})
export class JobsModule {}
