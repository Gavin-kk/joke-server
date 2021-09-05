import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from '@src/module/email/v1/dto/send-email.dto';

@ApiTags('邮件服务')
@Controller('api/v1/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({ summary: '发送邮件' })
  @Get('code')
  public async sendEmail(
    @Query() { email, type }: SendEmailDto,
  ): Promise<void> {
    await this.emailService.sendEmailCode(email, +type);
  }
}
