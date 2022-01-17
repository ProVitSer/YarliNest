import { KerioService } from '@app/kerio/kerio.service';
import { ConferenceList, GetConferenceListResponse } from '@app/kerio/types/interfaces';
import { LoggerService } from '@app/logger/logger.service';
import { LowdbService } from '@app/lowdb/lowdb.service';
import { DBConference } from '@app/lowdb/types/interfaces';
import { SeleniumService } from '@app/selenium/selenium.service';
import { TGService } from '@app/telegram/telegram.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { DATA_FORMAT } from "./config";


@Injectable()
export class ConferenceService {

    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly kerio: KerioService,
        private readonly lowdb: LowdbService,
        private readonly tg: TGService,
        private readonly selenium: SeleniumService
    ){}

    public async startCreateConference(driver: any): Promise<void>{
        try {
            const startDate = moment().format(DATA_FORMAT);
            const endDate = moment().add(this.configService.get('conference.days'), 'days').format(DATA_FORMAT);
            const kerioConferenceList = await this.kerio.getConferenceList(startDate, endDate) as ConferenceList[];
            const lowdbConferenceList = await this.lowdb.findAll('conference') as DBConference[];

            if(kerioConferenceList.length === 0){
                return await this.deleteNoUseConference(driver,kerioConferenceList, lowdbConferenceList)
            } else {

            }
        }catch(e){
            this.log.error(e);
            this.tg.tgAlert(`Ошибка старта получения информации и изменения конференции ${e}`)
        }
    }

    private async deleteNoUseConference(driver: any, kerioConfs: ConferenceList[], dbConfs: DBConference[]): Promise<void> {
            const deleteConference = this.checkDeleteConference(kerioConfs,dbConfs);
            return await this.deleteConference(driver, deleteConference);
    }

    private checkDeleteConference(kerioConfs: ConferenceList[], dbConfs: DBConference[]): DBConference[]{
        try {
            const filterConf = dbConfs.filter( (dbConf: DBConference) => !kerioConfs.map((kerioConf: ConferenceList) => {return kerioConf.summary}).includes(dbConf.theme));
            return filterConf.filter((dbConf: DBConference) => { return dbConf.theme !==  "Тест Тестович"});
        } catch(e){
            this.log.error(e);
            this.tg.tgAlert(`Ошибка нахождения разницы между конференциями kerio и БД differenceKerioDBConference ${e}`)
        }
    }

    private async deleteConference(driver: any, conferenceList: DBConference[]): Promise<any>{
        return await Promise.all(conferenceList.map( async conf => {
            await this.selenium.login(driver, conf.organizer); //Авторизуемся под отвественным пользователем
            await this.selenium.deleteConference(driver, conf.theme); //Передаем название конференции которуюнадо удалить
            await this.lowdb.deleteConference(conf.theme, 'conference'); //Удаление конференций, которых нет в выгрузке из Kerio
            await this.selenium.logout(driver); //Выходим изинтерфейса 3CX
        }))

    }
}


// @Injectable()
// class FormatConference {

//     constructor(
//         private readonly configService: ConfigService,
//     ){}

// }