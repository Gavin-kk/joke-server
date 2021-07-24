import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditPasswordDto {
  @ApiProperty({ description: '修改的密码' })
  @IsNotEmpty({ message: '参数错误' })
  newPassword: string;

  @ApiProperty({ description: '邮箱验证码' })
  @IsNotEmpty({ message: '参数错误' })
  @IsNumber({}, { message: '必须是number类型' })
  VCode: number;
}
