import { Module } from '@nestjs/common';
import { SyncDataService } from './sync-data.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger/logger.module';
import { KerioModule } from '@app/kerio/kerio.module';
import { TGModule } from '@app/telegram/telegram.module';
import { ConferenceServiceModule } from '@app/conference-service/conference-service.module';
import { SeleniumModule } from '@app/selenium/selenium.module';

@Module({
  imports: [ScheduleModule.forRoot(),LoggerModule, ConfigModule, KerioModule, TGModule, ConferenceServiceModule, SeleniumModule],
  exports: [SyncDataService],
  providers: [SyncDataService]
})
export class SyncDataModule {}
