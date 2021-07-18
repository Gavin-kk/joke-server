import { Controller, Get, Logger, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/v1/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({ summary: '发送邮件' })
  @Get('code')
  sendEmail(@Query('email') email: string) {
    return this.emailService.sendEmailCode(email);
  }
}
