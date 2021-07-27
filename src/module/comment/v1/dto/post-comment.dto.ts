import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class PostCommentDto {
  @ApiProperty({ description: '评论的文章id' })
  @IsNumber({}, { message: '参数错误' })
  articleId: number;

  @ApiProperty({
    description: '回复评论的id 为空或者不传 就是一级评论',
    required: false,
  })
  targetId: number;

  @ApiProperty({ description: '评论的内容' })
  @IsString({ message: '参数错误' })
  content: string;
}
