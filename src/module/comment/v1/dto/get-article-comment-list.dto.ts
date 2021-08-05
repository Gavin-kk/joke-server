import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class GetArticleCommentListDto {
  @ApiProperty({ description: '一级评论的id' })
  @IsNumberString({}, { message: '参数类型错误' })
  commentId: string;
}
