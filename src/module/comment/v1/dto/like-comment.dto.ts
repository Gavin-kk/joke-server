import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsIn, Min } from 'class-validator';
export enum LikeCommentType {
  firstLevelComment,
  secondaryComment,
}

export class LikeCommentDto {
  @ApiProperty({ description: '评论的id' })
  @IsNumber({}, { message: '参数类型错误' })
  @Min(1, { message: '评论不存在' })
  commentId: number;
  @ApiProperty({
    description: '评论类型, 一级评论或二级评论, 参数为0|1 0一级评论',
  })
  @IsIn([0, 1], { message: '参数错误' })
  type: LikeCommentType;
}
