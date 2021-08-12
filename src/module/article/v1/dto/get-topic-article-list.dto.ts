import { IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum GetTopIcType {
  default,
  latest,
}

export class GetTopicArticleListDto {
  @ApiProperty({ description: '话题的id' })
  @IsNotEmpty({ message: 'id不可为空' })
  topicId: number;

  @ApiProperty({ description: '分页页码' })
  @IsNotEmpty({ message: '页码不可为空' })
  pageNum: string;

  @ApiProperty({ description: '分页页码' })
  @IsNotEmpty({ message: '页码不可为空' })
  @IsNumberString({}, { message: '参数类型错误' })
  type: GetTopIcType;
}
