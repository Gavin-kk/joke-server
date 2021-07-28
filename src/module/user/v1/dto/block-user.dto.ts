import { IsNumber, Min, MIN } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({ description: '被拉黑用户的id' })
  @IsNumber({}, { message: '不是number类型' })
  @Min(1, { message: '参数错误' })
  blackUserId: number;
}
