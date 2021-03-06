import { Logger, ValidationPipe, WebSocketAdapter } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv-flow';
import multipart from 'fastify-multipart';
import { Log4jsLogger } from '@nestx-log4js/core';
import * as path from 'path';
import * as fs from 'fs';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { WsAdapter } from '@nestjs/platform-ws';

dotenv.config();

const logger: Logger = new Logger('main');

const keyFile: Buffer = fs.readFileSync(
  path.join(__dirname, 'key', 'www.newin.top.key'),
);
const certFile: Buffer = fs.readFileSync(
  path.join(__dirname, 'key', 'www.newin.top.pem'),
);
const httpsOptions: { key: Buffer; cert: Buffer } = {
  key: keyFile,
  cert: certFile,
};
async function bootstrap(): Promise<NestFastifyApplication> {
  const app: NestFastifyApplication =
    await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({ https: httpsOptions }),
      { httpsOptions },
    );

  // 注册文件上传中间件
  await app.register(multipart);

  const config: Omit<OpenAPIObject, 'components' | 'paths'> =
    new DocumentBuilder()
      .setTitle('嘻嘻哈哈移动端api接口文档')
      // .setDescription('这是商城后台管理系统项目')
      .setVersion('1.0.0')
      // .addTag('我是一个标签')
      .addBearerAuth()
      .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  // 第一个参数是路径 就是你要在那个url路径访问到这个 api 文档
  SwaggerModule.setup('api-docs', app, document);

  // 启用静态资源服务
  app.useStaticAssets({
    root: path.join(__dirname, './upload-file'),
    prefix: '/static',
  });
  // 使用 ws 适配器
  app.useWebSocketAdapter(new WsAdapter(app));
  // 启用日志框架
  app.useLogger(app.get(Log4jsLogger));
  // 使用全局管道 验证
  app.useGlobalPipes(new ValidationPipe());
  // 使用全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  //  开启cors
  app.enableCors();

  await app.listen(process.env.APP_PORT, '0.0.0.0', (err) => {
    console.log(err, 'err');
  });
  return app;
}

bootstrap().then(async (app: NestFastifyApplication) => {
  logger.log(`api-docs: ${await app.getUrl()}/api-docs`);
});
