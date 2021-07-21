import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { join } from 'path';
import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from 'nestjs-redis/dist/redis.interface';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => ({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    entities: [join(__dirname, '../entitys/*.{ts,js}')],
    migrations: ['migration/*.ts'],
    timezone: 'UTC',
    charset: 'utf8mb4',
    multipleStatements: true,
    dropSchema: false,
    synchronize: true,
    logging: true,
  }),
};

export const redisConfig: RedisModuleAsyncOptions = {
  useFactory: (): RedisModuleOptions => ({
    port: +process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    db: 0,
  }),
};
