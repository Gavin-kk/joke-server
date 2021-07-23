import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { IFastifyRequest } from '@src/app';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadImagesDto } from '@src/module/upload/v1/dto/upload-images.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('文件上传模块')
@Controller('api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ description: '上传多个图片' })
  @ApiBody({
    type: UploadImagesDto,
  })
  @Post('images')
  @UseGuards(AuthGuard('jwt'))
  public async uploadImage(@Req() request: IFastifyRequest) {
    return this.uploadService.uploadImages(request);
  }
}
