import { Module } from '@nestjs/common';
import { RedisServiceN } from './redis.service';

@Module({
  controllers: [],
  providers: [RedisServiceN],
  exports: [RedisServiceN],
})
export class RedisModule {}
