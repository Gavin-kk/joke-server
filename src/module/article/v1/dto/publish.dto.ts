import { IsIn, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ArticleType } from '@src/entitys/article.entity';
import { ClassifyType } from '@src/module/article/v1/article.service';

export class PublishDto {
  @ApiProperty({ description: '文章内容' })
  @IsNotEmpty({ message: '内容不可为空' })
  content: string;

  @ApiProperty({ description: '文章的图片', required: false })
  contentImg?: string[];

  @ApiProperty({ description: '隐私状态 0所有人可见 1 仅自己可见' })
  @IsNumber({ allowNaN: false }, { message: '不是number类型' })
  @IsIn([0, 1], { message: '参数错误' })
  privacyStatus: 0 | 1;

  @ApiProperty({ description: '文章的类型 0 代表图文 1代表纯文字 2代表分享 3视频' })
  @IsNumber({ allowNaN: false }, { message: '不是number类型' })
  @IsIn([0, 1, 2, 3], { message: '参数错误' })
  type: ArticleType;

  @ApiProperty({ description: '当type等于3时 此项必填 视频的url' })
  videoUrl: string;

  @ApiProperty({ description: '当type等于3时 此项必填 视频的封面' })
  videoPic: string;

  @ApiProperty({ description: '文章分类的id', required: false })
  ACId: number;

  @ApiProperty({ description: '文章所属的分类 0 代表文章分类 1 代表话题分类' })
  isTopic?: ClassifyType;

  @ApiProperty({
    description: '话题分类的id 文章如果属于话题分类 则此参数必须传递',
  })
  topicId?: number;

  @ApiProperty({
    description: '发布文章时所在的地理位置 如果用户选择隐藏就发送 在某个不知名的地方',
  })
  address: string;

  @ApiProperty({
    description: '引用文章的id 可以为空 number类型',
    required: false,
  })
  shareId?: number;
}
