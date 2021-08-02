import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';
import { TopicEntity } from '@src/entitys/topic.entity';
import { RedisModule } from '@src/lib/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([TopicClassifyEntity, TopicEntity]), RedisModule],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {
  // implements NestModule
  // public configure(consumer: MiddlewareConsumer): any {
  //   consumer.apply(TestMiddleware).forRoutes(TopicController);
  // }
}
