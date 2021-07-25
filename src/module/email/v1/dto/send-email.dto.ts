import { IsEmail, IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const enum SendEmailType {
  // 修改邮箱验证码
  EditEmail,
  // 修改密码验证码
  EditPassword,
  // 登录验证码
  Login,
}

export class SendEmailDto {
  @ApiProperty({ description: '目标邮箱' })
  @IsEmail({}, { message: '邮箱格式错误' })
  email: string;

  @ApiProperty({
    description: '邮件类型 0 修改邮箱验证码 1 修改密码验证码 2 登录验证码',
  })
  @IsNotEmpty({ message: '类型不可为空' })
  @IsNumberString({}, { message: '类型错误' })
  type: SendEmailType;
}
