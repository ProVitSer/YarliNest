import { LoggerModule } from '@app/logger/logger.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LowdbService } from './lowdb.service';

@Module({
  imports:[ConfigModule,LoggerModule],
  providers: [LowdbService],
  exports: [LowdbService]
})
export class LowdbModule {}
