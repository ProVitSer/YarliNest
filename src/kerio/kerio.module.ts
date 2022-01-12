import { LoggerModule } from '@app/logger/logger.module';
import { TGModule } from '@app/telegram/telegram.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KerioService } from './kerio.service';

@Module({
  imports:[ConfigModule,LoggerModule, TGModule],
  providers: [KerioService],
  exports: [KerioService]
})
export class KerioModule {}
