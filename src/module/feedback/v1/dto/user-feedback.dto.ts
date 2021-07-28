import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserFeedbackDto {
  @ApiProperty({ description: '用户反馈的内容' })
  @IsString({ message: '参数类型错误' })
  @IsNotEmpty({ message: '反馈内容不可为空' })
  content: string;
}
