import { Injectable, Logger } from '@nestjs/common';
import { IFastifyRequest } from '@src/app';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { MultipartFile } from 'fastify-multipart';
import { promisify } from 'util';
import * as stream from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  private logger: Logger = new Logger('UploadService');
  private uploadFilePath: string = path.join(__dirname, '../../../upload-file');

  public async uploadImages(req: IFastifyRequest): Promise<string[]> {
    if (!req.isMultipart()) {
      this.logger.error('不是form-data请求');
      throw new NewHttpException('请求出错');
    }
    //  传入多个文件
    const files: AsyncIterableIterator<MultipartFile> = req.files({
      limits: {
        fileSize: 1024 * 1024 * 1027,
      },
    });
    return this.handleFiles(files);
  }

  private async handleFiles(
    files: AsyncIterableIterator<MultipartFile>,
  ): Promise<string[]> {
    const pipeline = promisify(stream.pipeline);
    // 访问上传文件的 url
    const uploadFileUrl: string[] = [];

    for await (const fileObj of files) {
      if (!fileObj.mimetype.includes('image')) {
        throw new NewHttpException('上传了不支持格式文件');
      }
      // 文件名
      const fileName = `${uuid()}${path.extname(fileObj.filename)}`;
      // 文件路径和文件名
      const filePathName = `${this.uploadFilePath}/${fileName}`;
      // 静态资源访问的路径
      const url = `http://${process.env.APP_HOST}:${process.env.APP_PORT}/static/${fileName}`;
      const writeStream: fs.WriteStream = fs.createWriteStream(filePathName);
      await pipeline(fileObj.file, writeStream);
      uploadFileUrl.push(url);
    }

    return uploadFileUrl;
  }
}
