import { Injectable, Logger } from '@nestjs/common';
import { IFastifyRequest } from '@src/app';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { MultipartFile } from 'fastify-multipart';
import { promisify } from 'util';
import * as stream from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import {
  UPLOAD_IMAGE_SIZE_LIMIT,
  UPLOAD_VIDEO_SIZE_LIMIT,
} from '@src/common/constant/upload.constant';
import Ffmpeg = require('fluent-ffmpeg');
import { unlink } from 'fs';

interface IUploadResponse {
  success: string[];
  notSupport: string[];
  restricted: string[];
}

export interface IUploadVideoSuccess {
  videoUrl: string;
  coverUrl: string;
}

@Injectable()
export class UploadService {
  private logger: Logger = new Logger('UploadService');
  private uploadImagePath: string = path.join(
    __dirname,
    '../../../upload-file/image',
  );
  private uploadVideoPath: string = path.join(
    __dirname,
    '../../../upload-file/video',
  );

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

    return this.handleImages(files);
  }

  public async uploadVideo(
    req: IFastifyRequest,
  ): Promise<{ success: IUploadVideoSuccess[]; fileNotSupported: string[] }> {
    if (!req.isMultipart()) {
      throw new NewHttpException('请求出错');
    }
    try {
      const files: MultipartFile[] = await req.saveRequestFiles({
        tmpdir: path.join(__dirname),
        limits: {
          fileSize: UPLOAD_VIDEO_SIZE_LIMIT,
        },
      });
      return this.handlerVideoTest(files);
    } catch (err) {
      throw new NewHttpException('文件大小超出限制');
    }
  }

  private async handlerVideoTest(
    files: MultipartFile[],
  ): Promise<{ success: IUploadVideoSuccess[]; fileNotSupported: string[] }> {
    // 文件上传成功的url数组
    const success: IUploadVideoSuccess[] = [];
    // 不支持的文件
    const fileNotSupported: string[] = [];
    // 已经上传的文件路径
    const uploadFilePath: { path: string; name: string }[] = [];
    for (const file of files) {
      if (!file.mimetype.includes('video')) {
        fileNotSupported.push(file.filename);
      } else {
        uploadFilePath.push({ path: file.filepath, name: file.filename });
      }
    }
    for (const fileObj of uploadFilePath) {
      const coverName = `${uuid()}.png`;
      const videoName = `${uuid()}.mp4`;
      const videoNewPath = path.join(this.uploadVideoPath, videoName);
      const coverDir = this.uploadImagePath;
      try {
        const videoUrl: string = await this.processingVideoTranscoding(
          fileObj.path,
          videoName,
          videoNewPath,
        );
        const coverUrl: string = await this.processingVideoCover(
          videoNewPath,
          coverName,
          coverDir,
        );
        success.push({ videoUrl, coverUrl });
      } catch (err) {
        fileNotSupported.push(fileObj.name);
        this.logger.error(err, '视频或视频封面处理失败');
      }
    }
    return { success, fileNotSupported };
  }

  // 处理视频转码
  private processingVideoTranscoding(
    filePath: string,
    videoName: string,
    outputDir: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const fg = new Ffmpeg();
      fg.input(filePath)
        .on('end', () => {
          resolve(
            `http://${process.env.APP_HOST}:${process.env.APP_PORT}/static/video/${videoName}`,
          );
        })
        .on('error', (err) => {
          reject(new Error(err));
        })
        .outputFormat('mp4')
        .output(outputDir)
        .run();
    });
  }
  // 处理视频封面
  private processingVideoCover(
    filePath: string,
    coverName: string,
    outputDir: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const fg = new Ffmpeg();
      fg.input(filePath)
        .on('end', () => {
          resolve(
            `http://${process.env.APP_HOST}:${process.env.APP_PORT}/static/image/${coverName}`,
          );
        })
        .on('error', (err) => {
          reject(new Error(err));
        })
        .screenshot({
          timestamps: [1],
          filename: coverName,
          folder: outputDir,
          size: '720x360',
        });
    });
  }

  private async handleImages(
    files: AsyncIterableIterator<MultipartFile>,
  ): Promise<IUploadResponse> {
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
      const filePathName: string = path.join(
        this.uploadImagePath,
        `./${fileName}`,
      );
      // 静态资源访问的路径
      const url = `http://${process.env.APP_HOST}:${process.env.APP_PORT}/static/image/${fileName}`;

      const writeStream: fs.WriteStream = fs.createWriteStream(filePathName);
      fileObj.file.on('limit', () => {
        exceedTheLimit.push(fileObj.filename);
        filePathIsNotSupported.push(filePathName);
        writeStream.end();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        Promise.reject().catch(() => {});
      });

      if (!fileObj.mimetype.includes('image')) {
        writeStream.end();
        await fileObj.toBuffer();
        fileNotSupported.push(fileObj.filename);
        filePathIsNotSupported.push(filePathName);
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

  async deleteVideo(videoName: string) {
    const unlike = promisify(unlink);
    await unlike(path.join(this.uploadVideoPath, videoName));
  }
  async deleteImage(imageName: string) {
    const unlike = promisify(unlink);
    await unlike(path.join(this.uploadImagePath, imageName));
  }
}
