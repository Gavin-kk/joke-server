import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';
import * as joi from 'joi';

export class GeocodeDto {
  @ApiProperty({ description: '纬度' })
  @IsNotEmpty({ message: '参数为空' })
  @IsNumberString({}, { message: '参数类型错误' })
  latitude: string;

  @ApiProperty({ description: '经度' })
  @IsNotEmpty({ message: '参数为空' })
  @IsNumberString({}, { message: '参数类型错误' })
  longitude: string;
}
