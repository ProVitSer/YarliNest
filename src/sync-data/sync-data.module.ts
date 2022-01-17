import { Module } from '@nestjs/common';
import { SyncDataService } from './sync-data.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger/logger.module';

@Module({
  imports: [ScheduleModule.forRoot(),LoggerModule, ConfigModule],
  exports: [SyncDataService],
  providers: [SyncDataService]
})
export class SyncDataModule {}
