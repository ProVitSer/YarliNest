import { KerioService } from '@app/kerio/kerio.service';
import { ConferenceAttendees, ConferenceList, GetConferenceListResponse } from '@app/kerio/types/interfaces';
import { LoggerService } from '@app/logger/logger.service';
import { LowdbService } from '@app/lowdb/lowdb.service';
import { DBConference } from '@app/lowdb/types/interfaces';
import { SeleniumService } from '@app/selenium/selenium.service';
import { TGService } from '@app/telegram/telegram.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { DATA_FORMAT } from "./config";
import { writeFile, readFile, access } from 'fs/promises'
import * as path from 'path';

export enum ConferenceAlert {
    NEW = '✅Создана новая конференция',
    DELETE = '❌Удалена измененная конференция'
}

export interface ConferenceAlertDescription {
    alert: ConferenceAlert
}

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

    public async startCreateConference(driver: any): Promise<any>{
        try {
            const startDate = moment().format(DATA_FORMAT);
            const endDate = moment().add(this.configService.get('conference.days'), 'days').format(DATA_FORMAT);
            const kerioConferenceList = await this.kerio.getConferenceList(startDate, endDate) as ConferenceList[];
            const lowdbConferenceList = await this.lowdb.findAll('conference') as DBConference[];

            if(kerioConferenceList.length != 0){
                const formatKerioConfList = await this.formatKerioConference(kerioConferenceList);
                await this.deleteNoUseConference(driver, formatKerioConfList, lowdbConferenceList);
                return await Promise.all( formatKerioConfList.map( async (conference: DBConference) =>{
                    await this.addConference(driver, conference);

                }))
            } else {
                return;
            }
        }catch(e){
            this.log.error(e);
            this.tg.tgAlert(`Ошибка старта получения информации и изменения конференции ${e}`)
        }
    }

    private async addConference(driver: any, kerioConfList: DBConference){
        try {
            let diffEmailConferenceUser;
            const resultSearchInDB = await this.lowdb.findByTheme(kerioConfList.theme, 'conference');
            if(resultSearchInDB){
                diffEmailConferenceUser = await this.getDiffEmailConferenceUser(resultSearchInDB, kerioConfList.emailNumberArray);
            }
    
            this.log.info('diffEmailConferenceUSer',diffEmailConferenceUser)
            //Проверяем существует конференция в БД или нет
            if (resultSearchInDB == undefined) { //Конференции в БД нет, создаем новую конференцию
                await this.selenium.login(driver, kerioConfList.organizer); //Авторизуемся в интерфейсе 3сх под ответственным пользователем 
                kerioConfList.id = await this.selenium.addConference(driver, kerioConfList); // Добавляем новую конференцию
                await this.tg.tgConfAlert({ alert: ConferenceAlert.NEW },kerioConfList); //Уведомляем к группу о создание новой конференции
                await this.lowdb.insert(kerioConfList, 'conference'); //Добавляем в БД информациюо новой конференции
                await this.selenium.logout(driver); //Выходим изинтерфейса 3CX
                return '';
            } else if (resultSearchInDB.theme == kerioConfList.theme && resultSearchInDB.date == kerioConfList.date && resultSearchInDB.hour == `${kerioConfList.hour}` && resultSearchInDB.minute == `${kerioConfList.minute}` && diffEmailConferenceUser.length == 0) { //Конференция уже существует и не требует изменений
                this.log.info(`По ${kerioConfList.theme} нет изменений`);
            } else {//Конференция существует, но не совпадает время или дата (пользователь поменял данные). Удаляем и пересоздаем
                await this.selenium.login(driver, kerioConfList.organizer); //Авторизуемся в интерфейсе 3сх под ответственным пользователем 
                await this.tg.tgConfAlert({ alert: ConferenceAlert.DELETE },resultSearchInDB); //Уведомляем к группу о создание новой конференции
                await this.selenium.deleteConference(driver, resultSearchInDB.theme); //Удаляем конференцию в интерфейсе 3СХ
                await this.lowdb.deleteConference(resultSearchInDB.theme, 'conference'); //Удаляем конференцию из БД
                kerioConfList.id = await this.selenium.addConference(driver, kerioConfList); //Добавляем новую конференцию, так как были изменение
                await this.tg.tgConfAlert({ alert: ConferenceAlert.NEW },kerioConfList); //Уведомляем к группу о создание новой конференции
                await this.lowdb.insert(kerioConfList, 'conference'); //Добавляем в БД информациюо новой конференции
                await this.selenium.logout(driver); //Выходим изинтерфейса 3CX
                return '';
            }
        } catch(e){
            this.log.error(e);
            this.tg.tgAlert(`Ошибка изменений конференций modifyConf`)
        }

    }

    private async deleteNoUseConference(driver: any, kerioConfs: DBConference[], dbConfs: DBConference[]): Promise<void> {
            const deleteConference = this.checkDeleteConference(kerioConfs,dbConfs);
            return await this.deleteConference(driver, deleteConference);
    }

    private checkDeleteConference(kerioConfs: DBConference[], dbConfs: DBConference[]): DBConference[]{
        try {
            const filterConf = dbConfs.filter( (dbConf: DBConference) => !kerioConfs.map((kerioConf: DBConference) => { return kerioConf.theme }).includes(dbConf.theme));
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

    private async formatKerioConference(conferencesList: ConferenceList[]): Promise<DBConference[]>{
        const emailNumberArray = [];
        const usersArray = [];
        const phonebook = await this.getPhonebook();
        return conferencesList.map( conference => {

            conference.attendees.map( (members: ConferenceAttendees ) => {
                if (members.emailAddress != 'meeting@yarli.ru' && members.emailAddress != 'Telephone-meeting@yarli.ru') {
                    if(phonebook[members.emailAddress.toLowerCase()] != undefined){
                        emailNumberArray.push(phonebook[members.emailAddress.toLowerCase()].exten); //Список почтовых адресов для добавления в конференцию
                        usersArray.push(phonebook[members.emailAddress.toLowerCase()].fio); //Список ФИО для добавления в уведомление
                    } else {
                        this.tg.tgAlert(`В телефонной книге отсутствует привязка добавочного номера к почте ${members.emailAddress.toLowerCase()}`)
                    }
                }
            })

            if (conference.description != "") {
                console.log('conference.description', conference.description)
                emailNumberArray.push(...conference.description.split('\n')); //Разбиваем на массив номера 79998881122\n74999998877 и добавляем к списку почтовых адресов
                usersArray.push(...conference.description.split('\n'));
            }

            const startTime = moment(moment(conference.start).local().format("DD-MM-YYYY HH:mm:ss"), 'DD-MM-YYYY HH:mm:ss');
            const endTime = moment(moment(conference.end).local().format("DD-MM-YYYY HH:mm:ss"), 'DD-MM-YYYY HH:mm:ss');

            return {
                theme: conference.summary,
                organizer: conference.attendees[1].emailAddress,
                fioOrganizer: phonebook[conference.attendees[1].emailAddress.toLowerCase()].fio,
                info: `${conference.summary}`,
                date: moment(conference.start).local().format("DD.MM.YYYY"),
                hour: moment(conference.start).local().format("HH"),
                minute: moment(conference.start).local().format("mm"),
                duration: endTime.diff(startTime, 'minutes'), //Время конференции из начала и конца конференции,
                fio: usersArray,
                emailNumberArray: emailNumberArray
    
            };
        })
    }

    private async getPhonebook(){
        return await readFile(path.join(__dirname, this.configService.get('conference.phonebookPath')));
    }

    private async getDiffEmailConferenceUser(dbConf:DBConference, kerioEmailNumberArray: Array<string> ){
        
        const diffEmailConferenceUSer = await new Promise((resolve,rejects) => {
            let conferenceUser;
            const diff = function (dbEmailArray, kerioEmailArray) {
                return dbEmailArray.filter(email => !kerioEmailArray.includes(email))
                    .concat(kerioEmailArray.filter(email => !dbEmailArray.includes(email)))
            }
    
            conferenceUser = diff(dbConf.emailNumberArray, kerioEmailNumberArray);
            resolve(conferenceUser)
        });
    }
}      