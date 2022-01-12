import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TGModule } from './telegram/telegram.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { KerioModule } from './kerio/kerio.module';
import { SyncDataModule } from './sync-data/sync-data.module';
import { LowdbModule } from './lowdb/lowdb.module';
import { SeleniumModule } from './selenium/selenium.module';
import configuration from '@app/config/config.provides';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }),TGModule, LoggerModule, KerioModule, SyncDataModule, LowdbModule, SeleniumModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule]
})
export class AppModule {}
