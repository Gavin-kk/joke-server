import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddVisitorDto {
  @ApiProperty({ description: '被访问的用户id' })
  @IsNotEmpty({ message: '不可为空' })
  @IsNumber({}, { message: '必须是number类型' })
  visitorUserId: number;
}
