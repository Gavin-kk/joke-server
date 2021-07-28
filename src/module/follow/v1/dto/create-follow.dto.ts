import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowDto {
  @ApiProperty({ description: '要关注的用户id' })
  @IsNumber({}, { message: '必须是数字类型' })
  @Min(1, { message: '参数错误' })
  follwoId: number;
}
