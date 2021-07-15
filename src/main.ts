import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import dotenv from 'dotenv-flow';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const config = new DocumentBuilder()
    .setTitle('nestjs后台管理系统api')
    .setDescription('这是商城后台管理系统项目')
    .setVersion('1.0')
    .addTag('我是一个标签')
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
}
bootstrap();
