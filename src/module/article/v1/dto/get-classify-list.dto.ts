import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetClassifyListDto {
  @ApiProperty({ description: '文章分类的id' })
  @IsNotEmpty({ message: 'id不可为空' })
  classifyId: string;

  @ApiProperty({ description: '文章列表的页码' })
  @IsNotEmpty({ message: '页码不可为空' })
  pageNum: string;
}
