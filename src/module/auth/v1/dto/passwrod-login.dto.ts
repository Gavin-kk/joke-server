import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class PasswordLogin {
  @ApiProperty({ description: '邮箱或手机号或昵称' })
  @IsNotEmpty({ message: '用户名不可为空' })
  username: string;
  @ApiProperty({ description: '账号密码' })
  @IsNotEmpty({ message: '密码不可为空' })
  @Length(6, 18, { message: '密码格式不正确' })
  password: string;
}
