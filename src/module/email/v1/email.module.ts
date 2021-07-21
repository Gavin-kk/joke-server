import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { sendEmailConfig } from 'src/config/send-email.config';
import { RedisModule } from '@src/lib/redis/redis.module';

@Module({
  imports: [MailerModule.forRootAsync(sendEmailConfig), RedisModule],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
