import { Controller, Get } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('文章模块')
@Controller('api/v1/article')
export class ArticleController {
  constructor(private readonly articleClassifyService: ArticleService) {}

  @ApiOperation({ summary: '获取文章所有的分类' })
  @Get('classify/list')
  public async getArticleClassify(): Promise<ArticleClassifyEntity[]> {
    return this.articleClassifyService.getAllList();
  }
}
