import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetUserTopicArticleListDto {
  @ApiPropertyOptional({ description: '要查询的目标用户id' })
  @IsNumberString({}, { message: '参数错误' })
  @IsOptional({})
  userId: string;

  @ApiProperty({ description: '要查询的目标用户id' })
  @IsNumberString({}, { message: '参数错误' })
  pageNum: string;
}
