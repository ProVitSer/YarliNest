import { KerioModule } from '@app/kerio/kerio.module';
import { LoggerModule } from '@app/logger/logger.module';
import { LowdbModule } from '@app/lowdb/lowdb.module';
import { SeleniumModule } from '@app/selenium/selenium.module';
import { TGModule } from '@app/telegram/telegram.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConferenceService } from './conference-service.service';

@Module({
  imports: [ConfigModule, LoggerModule, KerioModule, LowdbModule, TGModule, SeleniumModule],
  providers: [ConferenceService],
  exports:[ConferenceService]
})
export class ConferenceServiceModule {}
