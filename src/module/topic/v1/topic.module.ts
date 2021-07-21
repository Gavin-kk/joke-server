import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';
import { TopicEntity } from '@src/entitys/topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TopicClassifyEntity, TopicEntity])],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
