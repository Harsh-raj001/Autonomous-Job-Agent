import { Module } from '@nestjs/common';
import { AutoApplyService } from './apply.service';
import { GreenhouseApplyEngine } from './engines/greenhouse.engine';
import { LeverApplyEngine } from './engines/lever.engine';
import { AshbyApplyEngine } from './engines/ashby.engine';

@Module({
  providers: [AutoApplyService, GreenhouseApplyEngine, LeverApplyEngine, AshbyApplyEngine],
  exports: [AutoApplyService],
})
export class ApplyModule {}
