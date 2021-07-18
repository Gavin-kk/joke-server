import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import * as dotenv from 'dotenv-flow';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();

const logger = new Logger('main.ts');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.setBaseViewsDir('./module/email/v1/template');
  // app.setViewEngine('ejs');
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
  // 使用全局管道 验证
  app.useGlobalPipes(new ValidationPipe());
  // 使用全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  //  开启cors
  app.enableCors();

  await app.listen(process.env.APP_PORT);
}

bootstrap().then(() => {
  logger.log(
    `api-docs: http://${process.env.APP_HOST}:${process.env.APP_PORT}/api-docs`,
  );
});
