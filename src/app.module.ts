import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, redisConfig } from './config/database.config';
import { AuthModule } from './module/auth/v1/auth.module';
import { RedisModule } from 'nestjs-redis';
import { RedisModule as RedisModuleN } from './lib/redis/redis.module';
import { EmailModule } from './module/email/v1/email.module';

@Module({
  imports: [
    RedisModule.forRootAsync(redisConfig),
    TypeOrmModule.forRootAsync(databaseConfig),
    AuthModule,
    RedisModuleN,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
