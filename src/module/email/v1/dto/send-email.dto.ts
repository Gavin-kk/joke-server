import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export const enum SendEmailType {
  // 修改邮箱验证码
  EditEmail,
  // 修改密码验证码
  EditPassword,
  // 登录验证码
  Login,
}

export class SendEmailDto {
  @IsEmail({}, { message: '邮箱格式错误' })
  email: string;

  @IsNotEmpty({ message: '类型不可为空' })
  @IsNumber({}, { message: '类型错误' })
  type: SendEmailType;
}
