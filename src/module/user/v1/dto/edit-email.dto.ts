import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditEmailDto {
  @ApiProperty({ description: '新的邮箱' })
  @IsNotEmpty({ message: '邮箱不可为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  newEmail: string;

  @ApiProperty({ description: '需要验证本账号密码' })
  @IsNotEmpty({ message: '密码不可为空' })
  @IsString({ message: '密码是string类型' })
  password: string;

  @ApiProperty({ description: '邮件验证码' })
  @IsNumber({}, { message: '验证码类型错误' })
  VCode: number;
}
