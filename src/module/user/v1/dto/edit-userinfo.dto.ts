import { ApiProperty } from '@nestjs/swagger';

export class EditUserinfoDto {
  @ApiProperty({ description: '用户昵称' })
  nickname: string;
  @ApiProperty({ description: '0男 1女 2保密' })
  gender: number;
  @ApiProperty({ description: '家乡' })
  hometown: string;
  @ApiProperty({ description: '生日' })
  birthday: string;
  @ApiProperty({ description: '工作类型' })
  job: string;
  @ApiProperty({ description: '情感' })
  emotion: string;
  @ApiProperty({ description: '年龄' })
  age: number;
}
