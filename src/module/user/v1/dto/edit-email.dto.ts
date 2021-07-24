import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class EditEmailDto {
  @IsNotEmpty({ message: '邮箱不可为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  newEmail: string;

  @IsNumber({}, { message: '验证码类型错误' })
  VCode: number;
}
