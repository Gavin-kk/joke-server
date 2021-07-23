import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';

export type Ok = 'OK';

@Injectable()
export class RedisServiceN {
  private logger: Logger = new Logger('RedisService');
  private client: Redis;
  constructor(private readonly redisService: RedisService) {
    this.getClient();
  }
  private getClient() {
    this.client = this.redisService.getClient();
  }

  public async set(
    key: string,
    value: any,
    expire?: number,
  ): Promise<Ok | null> {
    return this.client.set(key, JSON.stringify(value), 'EX', expire || 60);
  }

  // 获取单个值
  public async get(key: string): Promise<any> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  // 获取多个值
  public async getm(...arg: string[]) {
    const result = await this.client.mget(arg);
    return result.map((item) => (item ? JSON.parse(item) : null));
  }

  // 获取所有的key
  private async getKeys(key = '*') {
    return this.client.keys(key);
  }

  // 清除所有数据
  public async clear() {
    return this.client.flushall();
  }

  // 删除单条数据
  public async del(key: string) {
    return this.client.del(key);
  }
}
