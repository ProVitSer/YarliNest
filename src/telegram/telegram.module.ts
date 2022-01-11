import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from "nestjs-telegram";
import { TGService } from './telegram.service';

@Module({
  imports:[
    ConfigModule,
    TelegramModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return { 
          botKey: configService.get('telegram.token')
        };
      },
      inject: [ConfigService]
    }),
  ],
  exports:[TGService],
  providers: [TGService],
})
export class TGModule {}