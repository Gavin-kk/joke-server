import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '@src/entitys/comment.entity';
import { ArticleEntity } from '@src/entitys/article.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { ReplyEntity } from '@src/entitys/reply.entity';
import { UserCommentLikeEntity } from '@src/entitys/user-comment-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      ArticleEntity,
      ReplyEntity,
      UserCommentLikeEntity,
    ]),
    RedisModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
