import { LoggerService } from '@app/logger/logger.service';
import { TGService } from '@app/telegram/telegram.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { Builder, By, until } from 'selenium-webdriver';
import * as login from '../config/config3cx';

@Injectable()
export class SeleniumService {

    constructor(
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private readonly tg: TGService
      ) {}

    public async getDriver(){
      let chromeCapabilities = webdriver.Capabilities.chrome()
      let chromeOptions = {
        acceptSslCerts: true,
        acceptInsecureCerts: true,
        excludeSwitches: ['--enable-automation'],
        ignoreDefaultArgs: ["--enable-automation"],
        useAutomationExtension: false,
      };
      return await new webdriver.Builder().forBrowser('chrome').setChromeOptions(chromeOptions).withCapabilities(chromeCapabilities).build();
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
}
