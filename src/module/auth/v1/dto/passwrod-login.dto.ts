import { ApiProperty } from '@nestjs/swagger';

export class PasswordLogin {
  @ApiProperty({ description: '邮箱或手机号或昵称' })
  username: string;
  @ApiProperty({ description: '账号密码' })
  password: string;
}
