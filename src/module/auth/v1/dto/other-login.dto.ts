import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OtherLoginDto {
  @ApiProperty({ description: '登录的类型 例如 weixin qq' })
  @IsString({ message: '必须是string类型' })
  @IsNotEmpty({ message: '登录类型不可为空' })
  type: string;

  @ApiProperty({ description: '第三方登录的openid' })
  @IsString({ message: '必须是string类型' })
  @IsNotEmpty({ message: 'openid不可为空' })
  openid: string;

  @ApiProperty({ description: '第三方平台用户昵称', required: false })
  nickname?: string;

  @ApiProperty({ description: '第三方平台用户头型', required: false })
  avatar?: string;
}
