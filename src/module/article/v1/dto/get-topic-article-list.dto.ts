import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTopicArticleListDto {
  @ApiProperty({ description: '话题的id' })
  @IsNotEmpty({ message: 'id不可为空' })
  topicId: string;

  @ApiProperty({ description: '分页页码' })
  @IsNotEmpty({ message: '页码不可为空' })
  pageNum: string;
}
