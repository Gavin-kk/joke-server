import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '@src/entitys/comment.entity';
import { ArticleEntity } from '@src/entitys/article.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { ReplyEntity } from '@src/entitys/reply.entity';
import { UserCommentLikeEntity } from '@src/entitys/user-comment-like.entity';
import { CheckLoginWeakenedMiddleware } from '@src/common/middleware/check-login-weakened.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      ArticleEntity,
      ReplyEntity,
      UserCommentLikeEntity,
    ]),
    RedisModule,
    JwtModule.register({}),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckLoginWeakenedMiddleware).forRoutes(CommentController);
  }
}
