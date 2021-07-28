import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@src/lib/redis/redis.module';
import { FeedbackEntity } from '@src/entitys/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackEntity]), RedisModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
