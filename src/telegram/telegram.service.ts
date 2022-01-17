
import { Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from 'nestjs-telegram';


@Injectable()
export class TGService {
    private readonly chartId = this.configService.get('telegram.chartId');

    constructor(
        private readonly telegramService: TelegramService,
        private readonly configService: ConfigService
      ) {}

    public async tgAlert(message: string): Promise<any> {
        try{
            return await this.telegramService.sendMessage({
                chat_id: this.chartId,
                text: message,
                parse_mode: 'html',
            }).toPromise();
        } catch(e){
            console.log(JSON.stringify(e))
        }

    }
}