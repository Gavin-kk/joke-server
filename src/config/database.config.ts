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
    entities: [join(__dirname, '../module/entitys/*.{ts,js}')],
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
    port: 6379,
    host: '127.0.0.1',
    password: '728156123asd',
    db: 0,
  }),
};
