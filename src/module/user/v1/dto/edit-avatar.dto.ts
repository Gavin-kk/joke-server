import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditAvatarDto {
  @ApiProperty({ description: '用户头像的url' })
  @IsString({ message: '必须是string类型' })
  @IsNotEmpty({ message: '不可为空' })
  avatarUrl: string;
}
