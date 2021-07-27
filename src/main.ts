import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv-flow';
import multipart from 'fastify-multipart';
import { Log4jsLogger } from '@nestx-log4js/core';
import * as path from 'path';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { UPLOAD_IMAGE_SIZE_LIMIT } from '@src/common/constant/upload.constant';

dotenv.config();

const logger = new Logger('main.ts');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // 注册文件上传中间件
  await app.register(multipart, { throwFileSizeLimit: false });
  // await app.register(multipart);

  const config = new DocumentBuilder()
    .setTitle('嘻嘻哈哈移动端api接口文档')
    // .setDescription('这是商城后台管理系统项目')
    .setVersion('1.0')
    // .addTag('我是一个标签')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // 第一个参数是路径 就是你要在那个url路径访问到这个 api 文档
  SwaggerModule.setup('api-docs', app, document);

  // 启用静态资源服务
  app.useStaticAssets({
    root: path.join(__dirname, './upload-file'),
    prefix: '/static',
  });
  // 启用日志框架
  app.useLogger(app.get(Log4jsLogger));
  // 使用全局管道 验证
  app.useGlobalPipes(new ValidationPipe());
  // 使用全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  //  开启cors
  app.enableCors();

  await app.listen(process.env.APP_PORT);
  return app;
}

bootstrap().then(async (app) => {
  logger.log(`api-docs: ${await app.getUrl()}/api-docs`);
});
