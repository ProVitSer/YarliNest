import { Injectable } from '@nestjs/common';
import { HttpService } from '@app/http/http.service'
import { RequestConfigInterface, RequestMethodType } from '@app/http/interfaces';
import { ConfigService } from '@nestjs/config';
import { GetConferenceListRequest, GetConferenceListResponse, GetPhonebookRequest, GetPhonebookResponse, GetTokenRequest, GetTokenResponse } from './types/interfaces';
import { LoggerService } from '@app/logger/logger.service';
import { TGService } from '@app/telegram/telegram.service';

@Injectable()
export class KerioService {
    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly tg: TGService
    ){}


    private async getAuthToken(): Promise<GetTokenResponse> {

      const json: GetTokenRequest = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "Session.login",
        "params": {
            "userName": this.configService.get('kerio.username'),
            "password": this.configService.get('kerio.password'),
            "application": {
                "name": "Sample app",
                "vendor": "Kerio",
                "version": "1.0"
            }
        }
      };

      try{
        const api = this.getRequest(RequestMethodType.get, json);
        const response =  await api.request();
        
        if (!response) {
          this.log.info(`Отсутствует результат на запрос токена ${JSON.stringify(response)}`);
          this.tg.tgAlert(`Ошибка получения токена getToken`);
          throw `Отсутствует результат на запрос токена ${JSON.stringify(response)}`;
        };
        
        const result = {
          token: response.body.result.token,
          cookie: response.headers['set-cookie']
        };
        
        return result as GetTokenResponse;  
      } catch(e){
        this.log.error(e);
        this.tg.tgAlert('Ошибка получения токена getToken')
      }

    }

    public async getConferenceList(startDate: string, endDate: string): Promise<GetConferenceListResponse | []> {
      const { token, cookie } = await this.getAuthToken();
      const conferenceInfo: GetConferenceListRequest = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "Occurrences.get",
        "params": {
          "query": {
            "fields": [
              "access",
              "summary",
              "location",
              "description",
              "categories",
              "start",
              "end",
              "attendees"
            ],
            "start": 0,
            "limit": -1,
            "combining": "And",
            "conditions": [{
                "fieldName": "start",
                "comparator": "GreaterEq",
                "value": startDate
                },
                {
                "fieldName": "end",
                "comparator": "LessThan",
                "value": endDate
                },
                {
                "fieldName": "location",
                "value": "Telephone-meeting"
                }
            ]
            },
            "folderIds": [
              this.configService.get('kerio.storage')
            ]
        }
      }

      try{
        const api = this.getRequest(RequestMethodType.post, conferenceInfo, cookie, token);
        const response =  await api.request();
        
        if (response.body.result.totalItems == 0) {
          this.log.info(`Отсутствует результат на запрос списка конференций ${JSON.stringify(response.body.result)}`);
          return [];
        }
        this.log.info(`Получены данные со списком конференций ${JSON.stringify(response.body.result)}`);
        return response.body.result.list;
      } catch(e){
        this.log.error(`Ошибка запроса списка конференций ${JSON.stringify(e)}`);
        this.tg.tgAlert('Ошибка запроса списка конференций getConferenceList')
      }


    }


    public async getPhonebook(userLimit: number): Promise<GetPhonebookResponse[]>{
      const { token,cookie } = await this.getAuthToken();
      const phonebookInfo: GetPhonebookRequest = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "Contacts.get",
        "params": {
            "folderIds": [],
            "query": {
                "start": 0,
                "limit": userLimit
            }
        }
      }

      try{
        const api = this.getRequest(RequestMethodType.get, phonebookInfo, cookie, token);
        const response =  await api.request();
        return response.body.result.list;
      } catch(e){
        this.log.error(`Ошибка запроса списка телефонной книги ${JSON.stringify(e)}`);
        this.tg.tgAlert('Ошибка запроса списка телефонной книги getPhonebook')
      }
      
    }

    private getRequestConfig(metod: RequestMethodType, cookie: string = '', token: string = ''): RequestConfigInterface {
      return {
        host: this.configService.get('kerio.domain'),
        path: this.configService.get('kerio.path'),
        method: metod,
        addHeaders: {
          'Content-type': 'application/json-rpc; charset=utf-8',
          'Cookie': cookie,
          'X-Token': token
        }
      };
  }

    private getRequest(metod: RequestMethodType,  data: Object = {}, cookie: string = '', token: string = ''): HttpService{
      const config = this.getRequestConfig(metod, cookie, token)
      return new HttpService(config, data);

    }

}

