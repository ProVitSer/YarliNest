import { ConferenceService } from '@app/conference-service/conference-service.service';
import { KerioService } from '@app/kerio/kerio.service';
import { GetPhonebookResponse } from '@app/kerio/types/interfaces';
import { LoggerService } from '@app/logger/logger.service';
import { SeleniumService } from '@app/selenium/selenium.service';
import { TGService } from '@app/telegram/telegram.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import * as fs from 'fs';
import { writeFile, readFile, access } from 'fs/promises'

@Injectable()
export class SyncDataService {
    private isConfCreateEnd: boolean = true;
    
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly tg: TGService,
        private readonly kerio: KerioService,
        private readonly conference: ConferenceService,
        private readonly selenium: SeleniumService
    ){}

    onApplicationBootstrap() {}

    @Interval(120000)
    async syncConferenceByKerioCalendar(){
        if(this.isConfCreateEnd === true){
            this.isConfCreateEnd = false;
            await this.conference.startCreateConference();
            this.isConfCreateEnd = true
        }
        return;
    }

    @Cron(CronExpression.EVERY_WEEK)
    async updatePhonebook(){
        try {
            const kerioPhonebook = await this.kerio.getPhonebook(1000);
            const formatedPhonebook = await this.formatKerioPhonebook(kerioPhonebook);
            const newPhonebooks = formatedPhonebook.reduce((acc, item) => {
                acc[item.email] = item;
                delete acc[item.email].email
                return acc;
            }, {});
            await writeFile('./dist/config/phonebook.json', JSON.stringify(newPhonebooks));
            await writeFile('./src/config/phonebook.json', JSON.stringify(newPhonebooks));
            this.tg.tgAlert(`Синхронизация контактной книги прошла успешно`)
        }catch(e){
            this.log.error(JSON.stringify(e));
            this.tg.tgAlert(`Синхронизация контактной книги прошла не успешно ${e}`)
        }
    }

    private async formatKerioPhonebook(phonebook: GetPhonebookResponse[]){
        const phonebookArray = [];
        await Promise.all(phonebook.map((contact: GetPhonebookResponse) => {
            if (contact.phoneNumbers.find(phone => phone.type == 'TypeWorkVoice' && phone.number.length == 3)) {
                phonebookArray.push({
                    email: contact.emailAddresses[0].address,
                    exten: contact.phoneNumbers.find(phone => phone.type == 'TypeWorkVoice').number,
                    fio: contact.commonName,
                })
            }
        }))
        return phonebookArray;
    }
}
