import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import * as moment from 'moment';
import { RedisServiceN } from '../../../lib/redis/redis.service';
import { NewHttpException } from '../../../common/exception/customize.exception';

moment.locale('zh-cn');

@Injectable()
export class EmailService {
  private logger: Logger = new Logger('EmailService');
  private emailHost: string = process.env.EMAIL_AUTH_USER;

  constructor(
    private readonly mailerService: MailerService,
    private readonly redisService: RedisServiceN,
  ) {}

  async sendEmailCode(email: string) {
    // 判断是否已经发送
    const isExists = await this.redisService.get(email);
    if (isExists) {
      throw new NewHttpException('操作频繁', 400);
    }

    const code: number = +(Math.random() * 899999 + 100000).toFixed();
    try {
      const sendMailOptions: ISendMailOptions = {
        to: email,
        from: this.emailHost,
        subject: '用户登录验证',
        template: join(__dirname, '../template/email/code.ejs'), //这里写你的模板名称，如果你的模板名称的单名如 validate.ejs ,直接写validate即可 系统会自动追加模板的后缀名,如果是多个，那就最好写全。
        context: {
          code, //验证码
          date: moment().format('LLLL'), //日期
          sign: '嘻嘻哈哈官方团队', //发送的签名,当然也可以不要
        },
      };

      // 发送验证码
      await this.mailerService.sendMail(sendMailOptions);
      this.logger.log(`${email}验证码发送成功`);
      const result = await this.redisService.set(email, code, 100000);
      if (result === 'OK') {
        this.logger.log(`${email}:${code}存入缓存成功`);
      }
      return 'ok';
    } catch (error) {
      //发送失败
      this.logger.error(error, 'EmailService-sendMail-40');
      return { error };
    }
  }
}
