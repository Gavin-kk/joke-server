import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublishDto } from './dto/publish.dto';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { UsersEntity } from '@src/entitys/users.entity';
import { Auth } from '@src/common/decorator/auth.decorator';
import { ArticleEntity } from '@src/entitys/article.entity';

@ApiTags('文章模块')
@Controller('api/v1/article')
export class ArticleController {
  constructor(private readonly articleClassifyService: ArticleService) {}

  @ApiOperation({ summary: '获取文章所有的分类' })
  @Get('classify/list')
  public async getArticleClassify(): Promise<ArticleClassifyEntity[]> {
    return this.articleClassifyService.getAllList();
  }

  @ApiOperation({ summary: '获取指定的文章详情' })
  @Get(':id')
  public async getArticleDetail(@Param('id') id: string) {
    return this.articleClassifyService.getArticleDetail(+id);
  }

  @ApiOperation({
    summary: '通过id获取某一条分类下的所有文章',
  })
  @Get(':classifyId/list')
  public async getArticleListOfClassify(
    @Param('classifyId') classifyId: string,
  ): Promise<ArticleEntity[]> {
    return this.articleClassifyService.getArticleListOfClassify(+classifyId);
  }

  @ApiOperation({ summary: '发布文章' })
  @ApiBearerAuth()
  @Post('publish')
  @Auth()
  public async postArticle(
    @Body() publishDto: PublishDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    await this.articleClassifyService.createArticle(publishDto, user);
  }

  @ApiOperation({
    summary: '通过文章id删除文章',
    description: '只能删除自己的',
  })
  @Delete('/delete/:id')
  @Auth()
  public async deleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    await this.articleClassifyService.removeArticle(+id, user);
  }
}
