import { Module } from '@nestjs/common';
import { LowdbService } from './lowdb.service';

@Module({
  providers: [LowdbService]
})
export class LowdbModule {}
