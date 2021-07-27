import { Injectable, Logger } from '@nestjs/common';
import { IFastifyRequest } from '@src/app';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { MultipartFile } from 'fastify-multipart';
import { promisify } from 'util';
import * as stream from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { UPLOAD_IMAGE_SIZE_LIMIT } from '@src/common/constant/upload.constant';
import * as EventEmitter from 'events';

interface IUploadResponse {
  success: string[];
  notSupport: string[];
  restricted: string[];
}

@Injectable()
export class UploadService {
  private logger: Logger = new Logger('UploadService');
  private uploadFilePath: string = path.join(__dirname, '../../../upload-file');

  public async uploadImages(req: IFastifyRequest): Promise<IUploadResponse> {
    if (!req.isMultipart()) {
      this.logger.error('不是form-data请求');
      throw new NewHttpException('请求出错');
    }
    //  传入多个文件
    const files: AsyncIterableIterator<MultipartFile> = req.files({
      limits: {
        fileSize: UPLOAD_IMAGE_SIZE_LIMIT,
      },
    });

    return this.handleFiles(files);
  }

  private async handleFiles(files: AsyncIterableIterator<MultipartFile>): Promise<IUploadResponse> {
    // const a = new EventEmitter();

    // 是否上传成功
    const pipeline = promisify(stream.pipeline);
    // 访问上传文件的 url
    const uploadFileUrl: string[] = [];
    // 不支持的文件
    const fileNotSupported: string[] = [];
    // 超过限制的文件
    const exceedTheLimit: string[] = [];
    // 不支持的文件的路径
    const filePathIsNotSupported: string[] = [];

    for await (const fileObj of files) {
      // 文件名
      const fileName = `${uuid()}${path.extname(fileObj.filename)}`;
      // 文件路径和文件名
      const filePathName: string = path.join(this.uploadFilePath, `./${fileName}`);
      // 静态资源访问的路径
      const url = `http://${process.env.APP_HOST}:${process.env.APP_PORT}/static/${fileName}`;

      const writeStream: fs.WriteStream = fs.createWriteStream(filePathName);
      fileObj.file.on('limit', () => {
        exceedTheLimit.push(fileObj.filename);
        filePathIsNotSupported.push(filePathName);
        writeStream.end();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        Promise.reject().catch(() => {});
      });

      if (!fileObj.mimetype.includes('image')) {
        await fileObj.toBuffer();
        fileNotSupported.push(fileObj.filename);
      } else {
        await pipeline(fileObj.file, writeStream);
        uploadFileUrl.push(url);
      }
    }
    // 删除被拒绝上传的文件残留 后期可以考虑文件名存redis 定期删除这些文件 他们是0kb的
    for (const item of filePathIsNotSupported) {
      fs.unlinkSync(item);
    }

    return {
      success: uploadFileUrl,
      notSupport: fileNotSupported,
      restricted: exceedTheLimit,
    };
  }
}
