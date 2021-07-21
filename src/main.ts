import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import * as dotenv from 'dotenv-flow';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Log4jsLogger } from '@nestx-log4js/core';

dotenv.config();
//    "@nestjs/platform-express": "^7.6.15",
//"swagger-ui-express": "^4.1.6",
const logger = new Logger('main.ts');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

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
  //启用日志框架
  app.useLogger(app.get(Log4jsLogger));
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
// express 320.61 单实例
// 60k requests in 10.79s, 12 MB read
// 21k errors (21k timeouts)

// fastify 448.6 多实例
// 46k requests in 10.62s, 16.3 MB read
// 6k errors (6k timeouts)
