import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ArticleType } from '@src/entitys/article.entity';

export class PublishDto {
  @ApiProperty({ description: '文章内容' })
  @IsNotEmpty({ message: '内容不可为空' })
  content: string;

  @ApiProperty({ description: '文章的图片', required: false })
  contentImg?: string[];

  @ApiProperty({ description: '隐私状态 0所有人可见 1 仅自己可见' })
  @IsNumber({ allowNaN: false }, { message: '不是number类型' })
  @Min(0, { message: '最小不得小于0' })
  @Max(1, { message: '最大不得大于1' })
  privacyStatus: 0 | 1;

  @ApiProperty({ description: '文章的类型 0 代表图文 1代表纯文字 2代表分享' })
  @IsNumber({ allowNaN: false }, { message: '不是number类型' })
  @Min(0, { message: '最小不得小于0' })
  @Max(2, { message: '最大不得大于2' })
  type: ArticleType;

  @ApiProperty({ description: '文章分类的id' })
  @IsNumber({ allowNaN: false }, { message: '不是number类型' })
  ACId: number;

  @ApiProperty({
    description:
      '发布文章时所在的地理位置 如果用户选择隐藏就发送 在某个不知名的地方',
  })
  @IsString({ message: '请传递string类型' })
  @IsNotEmpty({ message: '不可为空 ' })
  address: string;

  @ApiProperty({
    description: '引用文章的id 可以为空 number类型',
    required: false,
  })
  shareId?: number;
}
