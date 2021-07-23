import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { RedisModule } from '@src/lib/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
