import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LikeType } from '@src/entitys/user-article-like.entity';

export class LikeDto {
  @ApiProperty({ description: '文章id' })
  @IsNumber({}, { message: '参数错误' })
  articleId: number;
  @ApiProperty({
    description:
      '点赞还是点踩 0踩 1赞 如果当前是已经点赞状态 再次请求携带type为1 请求本接口那么会取消点赞, 点踩同理',
  })
  @IsNumber({}, { message: '参数错误' })
  type: LikeType;
}
