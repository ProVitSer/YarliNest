import { LoggerModule } from '@app/logger/logger.module';
import { TGModule } from '@app/telegram/telegram.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeleniumService } from './selenium.service';

@Module({
  imports: [ConfigModule, LoggerModule, TGModule],
  providers: [SeleniumService],
  exports: [SeleniumService]
})
export class SeleniumModule {}
