import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import 'winston-daily-rotate-file';
const { combine, timestamp, label, printf, splat } = winston.format;
import * as moment from 'moment';
import { TGModule } from '@app/telegram/telegram.module';

@Module({
    imports: [
        TGModule,
        WinstonModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const transports: Transport[] = [];
                console.log(configService.get('log.maxSize'))
                transports.push(
                    new winston.transports.DailyRotateFile({
                        dirname: `${configService.get('log.path')}`,
                        level: 'info',
                        filename: `%DATE%.log`,
                        datePattern: `${configService.get('log.formatDate')}`,
                        handleExceptions: true,
                        json: true,
                        zippedArchive: true,
                        maxSize: `${configService.get('log.maxSize')}`,
                        maxFiles: `${configService.get('log.maxFiles')}`
                    }),
                );

                return {
                    format: combine(timestamp(), splat(), printf(({ level, message, timestamp }) => {
                        return `[${level}] - ${timestamp} ${JSON.stringify(message)}`;
                    })),
                    transports,
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule { }