import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './module/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRootAsync(databaseConfig), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
