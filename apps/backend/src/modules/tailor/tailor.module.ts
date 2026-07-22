import { Module } from '@nestjs/common';
import { TailorService } from './tailor.service';

@Module({
  providers: [TailorService],
  exports: [TailorService],
})
export class TailorModule {}
