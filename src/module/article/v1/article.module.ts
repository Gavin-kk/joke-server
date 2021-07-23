import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { ArticleEntity } from '@src/entitys/article.entity';
import { CommentEntity } from '@src/entitys/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleClassifyEntity,
      ArticleEntity,
      CommentEntity,
    ]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
