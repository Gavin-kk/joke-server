import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtherBindEmailDto {
  @ApiProperty({ description: '请传入第一次通过第三方登录接口返回的 id ' })
  @IsNumber({}, { message: '参数错误' })
  userBindId: number;

  @ApiProperty({ description: '要绑定的邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '要绑定邮箱的密码' })
  @IsNotEmpty({ message: '邮箱密码不可为空' })
  password: string;

  @ApiProperty({ description: '要绑定的邮箱验证码' })
  @IsNumber({}, { message: '验证码类型错误' })
  VCode: number;

  @ApiProperty({ description: '用户昵称' })
  @IsString({ message: '昵称类型错误' })
  nickname: string;

  @ApiProperty({ description: '用户头像' })
  @IsString({ message: '头像参数类型错误' })
  avatar: string;
}
