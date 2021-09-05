import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import * as moment from 'moment';
import { RedisServiceN } from '@src/lib/redis/redis.service';
import { NewHttpException } from '@src/common/exception/customize.exception';
import {
  REDIS_EDIT_EMAIL_KEY_METHOD,
  REDIS_EDIT_PASSWORD_KEY_METHOD,
  REDIS_EMAIL_KEY_METHOD,
  REDIS_LOGIN_KEY_METHOD,
  VCODE_EXPIRED,
} from '@src/common/constant/email.constant';
import { SendEmailType } from '@src/module/email/v1/dto/send-email.dto';

moment.locale('zh-cn');

@Injectable()
export class EmailService {
  private logger: Logger = new Logger('EmailService');
  private emailHost: string = process.env.EMAIL_AUTH_USER;

  constructor(
    private readonly mailerService: MailerService,
    private readonly redisService: RedisServiceN,
  ) {}

  public async sendEmailCode(email: string, type: SendEmailType) {
    // 验证码
    const code: number = +(Math.random() * 899999 + 100000).toFixed();

    switch (type) {
      case SendEmailType.EditEmail:
        // 判断是否已经发送 如果已发送抛出异常
        await this.checkWhetherToSend(REDIS_EDIT_EMAIL_KEY_METHOD(email));
        // 把验证码存入缓存
        await this.storeInCache(REDIS_EDIT_EMAIL_KEY_METHOD(email), code);
        break;
      case SendEmailType.EditPassword:
        // 判断是否已经发送 如果已发送抛出异常
        await this.checkWhetherToSend(REDIS_EDIT_PASSWORD_KEY_METHOD(email));
        // 把验证码存入缓存
        await this.storeInCache(REDIS_EDIT_PASSWORD_KEY_METHOD(email), code);
        break;
      case SendEmailType.Login:
        // 判断是否已经发送 如果已发送抛出异常
        await this.checkWhetherToSend(REDIS_LOGIN_KEY_METHOD(email));
        // 把验证码存入缓存
        await this.storeInCache(REDIS_LOGIN_KEY_METHOD(email), code);
        break;
      default:
    }
    try {
      // 发送验证码
      await this.sendEmail(email, code, type);
    } catch (err) {
      this.logger.error(err, '发送验证码错误');
      throw new NewHttpException('发送失败');
    }
  }

  private async checkWhetherToSend(email: string) {
    const isExists = await this.redisService.get(email);
    if (isExists) throw new NewHttpException('操作频繁', 400);
  }

  private async sendEmail(email: string, code: number, type: SendEmailType) {
    const subject = (): string => {
      switch (type) {
        case SendEmailType.Login:
          return '用户登录验证';
        case SendEmailType.EditPassword:
          return '用户修改密码验证';
        case SendEmailType.EditEmail:
          return '用户修改邮箱验证';
        default:
      }
    };
    const sendMailOptions: ISendMailOptions = {
      to: email,
      from: this.emailHost,
      subject: subject(),
      template: join(__dirname, '../template', 'email', 'code.ejs'), //这里写你的模板名称，如果你的模板名称的单名如 validate.ejs ,直接写validate即可 系统会自动追加模板的后缀名,如果是多个，那就最好写全。
      context: {
        code, //验证码
        date: moment().format('LLLL'), // 日期
        sign: '嘻嘻哈哈官方团队', // 发送的签名
      },
    };
    // 发送验证码
    await this.mailerService.sendMail(sendMailOptions);
  }

  private async storeInCache(email: string, code: number) {
    // 存入缓存
    const result: 'OK' | null = await this.redisService.set(
      email,
      code,
      VCODE_EXPIRED,
    );
    if (result === 'OK') this.logger.log(`${email}:${code}存入缓存成功`);
  }
}
