import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, redisConfig } from './config/database.config';
import { AuthModule } from './module/auth/v1/auth.module';
import { RedisModule } from 'nestjs-redis';
import { RedisModule as RedisModuleN } from './lib/redis/redis.module';
import { EmailModule } from './module/email/v1/email.module';
import { Log4jsModule } from '@nestx-log4js/core';
import { UserModule } from './module/user/v1/user.module';
import { ArticleModule } from './module/article/v1/article.module';
import { TopicModule } from './module/topic/v1/topic.module';
import { UploadModule } from './module/upload/v1/upload.module';

@Module({
  imports: [
    RedisModule.forRootAsync(redisConfig),
    TypeOrmModule.forRootAsync(databaseConfig),
    Log4jsModule.forRoot(),
    AuthModule,
    RedisModuleN,
    EmailModule,
    UserModule,
    ArticleModule,
    TopicModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
