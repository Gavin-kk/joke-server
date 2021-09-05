import { Module } from '@nestjs/common';
import { RedisServiceN } from './redis.service';
import { RedisModule as Redis } from 'nestjs-redis';
import { redisConfig } from '@src/config/database.config';

@Module({
  imports: [Redis.forRootAsync(redisConfig)],
  controllers: [],
  providers: [RedisServiceN],
  exports: [RedisServiceN],
})
export class RedisModule {}
