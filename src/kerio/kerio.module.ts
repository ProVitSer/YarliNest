import { Module } from '@nestjs/common';
import { KerioService } from './kerio.service';

@Module({
  providers: [KerioService]
})
export class KerioModule {}
