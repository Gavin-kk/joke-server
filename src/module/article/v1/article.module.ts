import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { ArticleEntity } from '@src/entitys/article.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { TopicArticlesEntity } from '@src/entitys/topic_article.entity';
import { TopicEntity } from '@src/entitys/topic.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CheckLoginWeakenedMiddleware } from '@src/common/middleware/check-login-weakened.middleware';
import { UserArticleLikeEntity } from '@src/entitys/user-article-like.entity';
import { UsersEntity } from '@src/entitys/users.entity';
import { CommentEntity } from '@src/entitys/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleClassifyEntity,
      ArticleEntity,
      TopicArticlesEntity,
      TopicEntity,
      UsersEntity,
      UserArticleLikeEntity,
      CommentEntity,
    ]),
    RedisModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CheckLoginWeakenedMiddleware).forRoutes(ArticleController);
  }
}
