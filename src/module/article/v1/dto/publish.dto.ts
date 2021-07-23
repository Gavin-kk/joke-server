import { IsEmpty, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ArticleType } from '@src/entitys/article.entity';

export class PublishDto {
  @ApiProperty({ description: '文章内容' })
  @IsNotEmpty({ message: '内容不可为空' })
  content: string;

  @ApiProperty({ description: '文章的图片', required: false })
  contentImg?: string[];

  @ApiProperty({ description: '文章的类型 0 代表图文 1代表纯文字 2代表分享' })
  @IsNumber({ allowNaN: false }, { message: '不是number类型' })
  type: ArticleType;

  @ApiProperty({ description: '文章分类的id' })
  @IsNumber({ allowNaN: false }, { message: '不是number类型' })
  ACId: number;

  @ApiProperty({
    description: '引用文章的id 可以为空 number类型',
    required: false,
  })
  shareId?: number;
}
