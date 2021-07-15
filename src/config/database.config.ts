import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory() {
    return {
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [join(__dirname, '../module/entity/*.{ts,js}')],
      migrations: ['migration/*.ts'],
      timezone: 'UTC',
      charset: 'utf8mb4',
      multipleStatements: true,
      dropSchema: false,
      synchronize: true,
      logging: true,
    };
  },
};
