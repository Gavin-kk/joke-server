// import { PartialType } from '@nestjs/swagger';
// import { PasswordLogin } from './passwrod-login.dto';  extends PartialType(PasswordLogin)

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EmailLoginDto {
  @ApiProperty({ description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不可为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsString({ message: '需要string类型' })
  email: string;

  @ApiProperty({ description: '邮箱的验证码' })
  @IsNotEmpty({ message: '验证码不可为空' })
  @IsNumber({}, { message: '需要number类型' })
  VCode: number;

  @ApiProperty({ description: '用户第一次登录时须携带密码', required: false })
  password?: string;
}
