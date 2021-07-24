import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { ArticleEntity } from '@src/entitys/article.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { TopicArticlesEntity } from '@src/entitys/topic_articles_article.entity';
import { TopicEntity } from '@src/entitys/topic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleClassifyEntity,
      ArticleEntity,
      TopicArticlesEntity,
      TopicEntity,
    ]),
    RedisModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
