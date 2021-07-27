import { Controller, Get, Post, Req } from '@nestjs/common';
import { UploadService } from './upload.service';
import { IFastifyRequest } from '@src/app';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadImagesDto } from '@src/module/upload/v1/dto/upload-images.dto';
import { Auth } from '@src/common/decorator/auth.decorator';

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
  public async uploadImage(
    @Req() request: IFastifyRequest,
  ): Promise<{ success: string[]; notSupport: string[]; restricted: string[] }> {
    return this.uploadService.uploadImages(request);
  }
}
