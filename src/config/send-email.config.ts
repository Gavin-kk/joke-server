import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Logger } from '@nestjs/common';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

export const sendEmailConfig: MailerAsyncOptions = {
  useFactory: () => ({
    transport: `smtps://${process.env.EMAIL_AUTH_USER}:${process.env.EMAIL_AUTH_PASS}@${process.env.EMAIL_HOST}`,
    preview: true, //是否开启预览，开启了这个属性，在调试模式下会自动打开一个网页，预览邮件
    defaults: {
      from: '"nest-modules" <modules@nestjs.com>', //发送人 你的邮箱地址
    },
    template: {
      dir: join(__dirname, '../module/email/template/email/'),
      adapter: new EjsAdapter(),
      options: {
        strict: true, //严格模式
      },
    },
  }),
};
