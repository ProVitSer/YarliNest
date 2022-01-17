import { TGService } from '@app/telegram/telegram.service';
import {Inject, Injectable} from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements LoggerService {
    constructor(
        @Inject('winston') private readonly logger: winston.Logger,
        private readonly tg: TGService,
    ) {}

    info(message: any, context?: any): void {
        this.logger.info(message, { context });
    }

    debug(message: string, context?: any): void {
        this.logger.debug(message, { context });
    }

    error(message: string, context?: any): void {
        this.logger.error(message, { context });
        //this.tg.tgAlert(message);
    }
}