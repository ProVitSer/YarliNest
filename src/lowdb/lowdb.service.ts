import { Injectable } from '@nestjs/common';
import * as path from "path";
import * as lowdb from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger/logger.service';
import { DBConference } from './types/interfaces';
const dirPath = path.join(__dirname, "../../src/config");


@Injectable()
export class LowdbService {
    private collection = { conference: [] };
    private db: lowdb.LowdbAsync<any>;


    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService
      ) {
        this.initDatabase();
    }

    async initDatabase(): Promise<void> {
        this.log.info(`Init Lowdb DB`);
        const adapter = new FileAsync(`${dirPath}/db.json`);
        this.db = await lowdb(adapter);
        await this.db.read();
    }

    public async insert( data: Object, collection: string ): Promise<any> {
        try {
          this.log.info(`Добавляем в базу ${collection}, ${JSON.stringify(data)}`);
    
          let dbData = await this.db.get(collection).value();
          dbData.push(data);
          return await this.db.set(collection, dbData).write();
        } catch (e) {
          this.log.error(`LowDB insert error: ${e}`);
        }
    }

    public async findById( id: string, collection: string ): Promise<any> {
      try{
        this.log.info(`Производим поиск ${id} в  ${collection}`);
  
        const values: Array<any> = await this.findAll(collection);
        const valueFound = values.find(obj => obj.id === id)
        return valueFound;
  
      }catch(e){
        this.log.error(`LowDB findById error: ${e}`);
      }
    }

    public async findByTheme( theme: string, collection: string ): Promise<any> {
      try{
        this.log.info(`Производим поиск ${theme} в  ${collection}`);
  
        const values: Array<any> = await this.findAll(collection);
        const valueFound = values.find(obj => obj.theme === theme)
        return valueFound;
  
      }catch(e){
        this.log.error(`LowDB findById error: ${e}`);
      }
    }

    public async findAll( collection: string ): Promise<any> {
      try{
        return await this.db.get(collection).value()
      } catch(e){
        this.log.error(`LowDB findAll error: ${e}`);
      }
    }

    public async deleteConference( theme: string,collection: string ): Promise<any> {
      try {
        this.log.info(`Удаляем  ${theme} из коллекции ${collection}`);
  
        let values = await this.db.get(collection).value();
        values = values.filter((val) => val.theme !== theme);
        return await this.db.set(collection, values).write();
      } catch (e) {
        this.log.error(`LowDB delete error: ${e}`);
      }
    }
}
