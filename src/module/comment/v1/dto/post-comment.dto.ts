import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PostCommentDto {
  @ApiProperty({ description: '评论的文章id' })
  articleId: number;

  @ApiProperty({
    description: '回复评论的id 为空或者不传 就是一级评论',
    required: false,
  })
  targetId: number;

  @ApiProperty({ description: '评论的内容' })
  @IsString({ message: '参数错误' })
  content: string;

  @ApiProperty({
    description: '一级评论id 如果是回复一级评论或回复一级评论的下评论 此项必填',
  })
  commentId: number;
}
