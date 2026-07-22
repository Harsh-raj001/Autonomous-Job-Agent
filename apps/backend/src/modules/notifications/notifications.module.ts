import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
