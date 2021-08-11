import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({ description: '话题名称' })
  @IsString({ message: '类型错误' })
  @IsNotEmpty({ message: '话题名称不可为空' })
  title: string;

  @ApiProperty({ description: '话题描述' })
  @IsString({ message: '类型错误' })
  @IsNotEmpty({ message: '话题描述不可为空' })
  desc: string;

  @ApiProperty({ description: '话题封面' })
  @IsString({ message: '类型错误' })
  @IsNotEmpty({ message: '话题封面不可为空' })
  imageUrl: string;

  @ApiProperty({ description: '话题分类的id' })
  @IsNumber({}, { message: '类型错误' })
  @IsNotEmpty({ message: '话题分类id不可为空' })
  TCId: number;
}
