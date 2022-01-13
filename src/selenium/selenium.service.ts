import { LoggerService } from '@app/logger/logger.service';
import { TGService } from '@app/telegram/telegram.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { Builder, By, until } from 'selenium-webdriver';
import * as login from '../config/config3cx';

@Injectable()
export class SeleniumService implements OnApplicationBootstrap{

    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly tg: TGService
      ) {}

    async onApplicationBootstrap() {
      try{
        const data = {
          theme: 'Конференция',
          info: 'Новая конференция',
          date: '14.01.2022',
          hour: '13',
          minute: '50',
          duration: 40,
          emailNumberArray: ['prokinvs@gmail.com','vp@voipnotes.ru']
        };
        const driver = await this.getDriver();
        this.addConference(driver,data);
      }catch(e){
        console.log(e)
      }

    }

    public async getDriver(){
      try{
        let chromeCapabilities = webdriver.Capabilities.chrome()
        let chromeOptions = {
          acceptSslCerts: true,
          acceptInsecureCerts: true,
          excludeSwitches: ['--enable-automation'],
          ignoreDefaultArgs: ["--enable-automation"],
          useAutomationExtension: false,
        };
        return await new webdriver.Builder().forBrowser('chrome').setChromeOptions(chromeOptions).withCapabilities(chromeCapabilities).build();
      } catch(e){
        console.log(e)
      }

    }

    public async login(driver: any, email: string) {
      try {
          await driver.get(`https://${this.configService.get('Pbx3CX.url')}/webclient/#/login`);
          await driver.wait(until.elementLocated(By.className('btn btn-lg btn-primary btn-block')), 10 * 10000);
          await driver.findElement(By.xpath("//input[@placeholder='Добавочный номер']")).sendKeys(login[email].exten);
          await driver.findElement(By.xpath("//input[@placeholder='Пароль']")).sendKeys(login[email].password);
          await driver.findElement(By.className('btn btn-lg btn-primary btn-block')).click();
          await driver.sleep(5000);
          return '';
      } catch (e) {
          this.log.error(`Ошибка авторизации на 3СХ ${JSON.stringify(e)}`);
          this.tg.tgAlert(`Ошибка авторизации на 3СХ login`);
      }
    }

    public async logout(driver: any) {
      try {
          await driver.sleep(5000);
          await driver.get(`https://${this.configService.get('Pbx3CX.url')}/webclient/#/people`);
          await driver.sleep(1000);
          await driver.findElement(By.xpath("//img[@class='ng-star-inserted']")).click();
          await driver.findElement(By.id("menuLogout")).click();
          return '';
      } catch (e) {
          this.log.error(`Ошибка выходаих web интерфейса 3СХ ${JSON.stringify(e)}`);
          this.tg.tgAlert(`Ошибка выходаих web интерфейса 3СХ logout`);
      }
    }

    public async deleteConference(driver: any, theme: string) {
      try {
          //await driver.sleep(5000);
          await driver.get(`https://${this.configService.get('Pbx3CX.url')}/webclient/#/conferences/list`);
          //await driver.findElement(By.id('btnNewConference')).click();
          await driver.sleep(5000);
          await driver.findElement(By.xpath("//input[@placeholder='Поиск ...']")).click();
          await driver.findElement(By.xpath("//input[@placeholder='Поиск ...']")).sendKeys(theme);
          await driver.sleep(10000);
          await driver.findElement(By.xpath(`//*[contains(text(), ' ${theme} ')]//parent::tr[1]//parent::tbody//parent::table//parent::meeting-list-item//parent::a[@routerlinkactive='selected']`)).click();
      await driver.sleep(10000);
          await driver.findElement(By.id("btnDeleteConference")).click();
          await driver.sleep(1000);
          await driver.findElement(By.id("btnOk")).click();
          await driver.sleep(1000);
          await this.tg.tgAlert(`Конференция ${theme} удалена или изменилось время проведения`);
          return '';
      } catch (e) {
        this.log.error(`Ошибка удаления конференции на 3СХ  ${JSON.stringify(e)}`);
        this.tg.tgAlert(`Ошибка удаления конференции на 3СХ deleteConference`);
      }
    }

    public async addConference(driver:any, data: any) {
      try {
          const { theme, info, date, hour, minute, duration, emailNumberArray } = data;
          await driver.get(`https://${this.configService.get('Pbx3CX.url')}/webclient/#/conferences/new`);
          await driver.sleep(5000);
  
          const radioSchedule = await driver.findElement(By.xpath("//input[@id='radioSchedule']/following::i"))
          radioSchedule.click();
  
          //Очистка и внесение даты конференции
          await driver.sleep(5000);
          await driver.findElement(By.id('dateInput')).clear();
          await driver.findElement(By.id('dateInput')).sendKeys(date);
          await driver.sleep(5000);
  
          // Очистка часа и занесение нового времени конференции. При удаление класса form-group, класс меняется form-group has-error
          await driver.findElement(By.xpath("//td[@class='form-group']/input")).click();
          await driver.findElement(By.xpath("//td[@class='form-group']/input")).clear();
          await driver.findElement(By.xpath("//td[@class='form-group has-error']/input")).sendKeys(hour);
  
          // Очистка минуты и занесение нового времени конференции. При удаление класса form-group ng-star-inserted, класс меняется form-group ng-star-inserted has-error
          await driver.findElement(By.xpath("//td[@class='form-group ng-star-inserted']/input")).click();
          await driver.findElement(By.xpath("//td[@class='form-group ng-star-inserted']/input")).clear();
          await driver.findElement(By.xpath("//td[@class='form-group ng-star-inserted has-error']/input")).sendKeys(minute);
  
  
          // Очистка длительности корнференции
          await driver.findElement(By.id('inputDuration')).clear();
          await driver.findElement(By.id('inputDuration')).sendKeys(duration);
  
          // Тема конференции
          await driver.findElement(By.id('inputName')).sendKeys(theme);
          // Дополнительная информация для участников
          await driver.findElement(By.id('txtDescription')).sendKeys(info);
  
          //Выберите E-mail / календарь для добавления
          await driver.findElement(By.id("calendarType")).click();
          await driver.sleep(1000);
          await driver.findElement(By.css("option[value='4: 5']")).click();
          await driver.sleep(2000);
  
          //Список пользователей учавствующих в конференции
          await driver.findElement(By.xpath("//app-sexy-search[@name='searchByNumberInput']/input[@placeholder='Поиск']")).click();
  
          for (let item in emailNumberArray) {
              await driver.findElement(By.xpath("//app-sexy-search[@name='searchByNumberInput']/input[@placeholder='Поиск']")).sendKeys(emailNumberArray[item]);
              await driver.sleep(5000);
              await driver.findElement(By.xpath("(//find-contact)[2]/div/div/button")).click()
              await driver.sleep(2000);
          }
          await driver.findElement(By.id("btnSave")).click();
          await driver.sleep(2000);
  
          //Поисксозданной конференции
          await this.searchConference(driver, theme);
  
          //Получение уникального ID конференции
          const confId = await driver.findElement(By.xpath("//*[@id='app-container']/ng-component/meeting-layout/div/div[2]/ng-component/div/div[2]/conference-preview/div/div/table/tbody/tr[3]/td[2]/p")).getText();
          await driver.sleep(2000);
          return confId;
  
  
  
      } catch (e) {
          this.log.error(`Ошибка добавление конференции на 3СХ ${JSON.stringify(e)}`);
          this.tg.tgAlert(`Ошибка добавление конференции на 3СХ addConference`);
      }
  }
  public async  searchConference(driver: any, theme: string) {
    try {
        await driver.get(`https://${this.configService.get('Pbx3CX.url')}/webclient/#/conferences/list`);
        await driver.sleep(5000);
        await driver.findElement(By.xpath("//input[@placeholder='Поиск ...']")).click();
        await driver.findElement(By.xpath("//input[@placeholder='Поиск ...']")).sendKeys(theme);
        await driver.sleep(10000);
        await driver.findElement(By.xpath(`//*[contains(text(), ' ${theme} ')]//parent::tr[1]//parent::tbody//parent::table//parent::meeting-list-item//parent::a[@routerlinkactive='selected']`)).click();
    } catch (e) {
      this.log.error(`Ошибка поиска конференции на 3СХ ${JSON.stringify(e)}`);
      this.tg.tgAlert(`Ошибка поиска конференции на 3СХ searchConference`);
    }

}
}
