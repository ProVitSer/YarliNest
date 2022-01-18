
import { ConferenceAlertDescription } from '@app/conference-service/conference-service.service';
import { DBConference } from '@app/lowdb/types/interfaces';
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

    public async tgConfAlert(conferenceAlert: ConferenceAlertDescription, data: DBConference){
        const alert = `${conferenceAlert.alert} \nНазвание конференции: ${data.theme}\nОрганизатор: ${data.fioOrganizer}\nДата начала: ${data.date}\nВремя начала: ${data.hour}:${data.minute}\nПродолжительность: ${data.duration}\nПримечания: ${data.info}\nУчастники: ${data.fio}\n`;
        this.tgAlert(alert)

    }  

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