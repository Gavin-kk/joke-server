import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class EditUserinfoDto {
  @ApiPropertyOptional({ description: '用户昵称' })
  nickname: string;
  @ApiPropertyOptional({ description: '用户头像' })
  avatar: string;
  @ApiPropertyOptional({ description: '0男 1女 2保密' })
  gender: number;
  @ApiPropertyOptional({ description: '家乡' })
  hometown: string;
  @ApiPropertyOptional({ description: '生日' })
  birthday: string;
  @ApiPropertyOptional({ description: '工作类型' })
  job: string;
  @ApiPropertyOptional({ description: '情感' })
  emotion: string;
  @ApiPropertyOptional({ description: '年龄' })
  age: number;
}
