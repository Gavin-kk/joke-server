import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleClassifyEntity])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
