import { Controller, Delete, Post, Query, Req } from '@nestjs/common';
import { IUploadVideoSuccess, UploadService } from './upload.service';
import { IFastifyRequest } from '@src/app';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadImagesDto } from '@src/module/upload/v1/dto/upload-images.dto';
import { Auth } from '@src/common/decorator/auth.decorator';
import { UploadVideoDto } from '@src/module/upload/v1/dto/upload-video.dto';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import * as joi from 'joi';
const schema = joi.string().required();

@ApiTags('文件上传模块')
@Controller('api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '图片上传模块 需要登录',
    description: '上传多个图片, 文件大小限制5M',
  })
  @ApiBody({
    type: UploadImagesDto,
  })
  @ApiBearerAuth()
  @Post('images')
  @Auth()
  public async uploadImage(@Req() request: IFastifyRequest): Promise<{
    success: string[];
    notSupport: string[];
    restricted: string[];
  }> {
    return this.uploadService.uploadImages(request);
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '视频上传模块 需要登录',
    description: '上传多个视频, 文件大小限制10M',
  })
  @ApiBody({
    type: UploadVideoDto,
  })
  @ApiBearerAuth()
  @Post('video')
  @Auth()
  public async uploadVideo(
    @Req() request: IFastifyRequest,
  ): Promise<{ success: IUploadVideoSuccess[]; fileNotSupported: string[] }> {
    return this.uploadService.uploadVideo(request);
  }

  @ApiBearerAuth()
  @Delete('video')
  @Auth()
  public async deleteVideo(
    @Query('videoName', new LineCheckTransformPipe(schema)) videoName: string,
  ): Promise<void> {
    return this.uploadService.deleteVideo(videoName);
  }

  @ApiBearerAuth()
  @Delete('image')
  @Auth()
  public async deleteImage(
    @Query('imageName', new LineCheckTransformPipe(schema)) imageName: string,
  ): Promise<void> {
    return this.uploadService.deleteImage(imageName);
  }
}
