import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublishDto } from './dto/publish.dto';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { UsersEntity } from '@src/entitys/users.entity';
import { Auth } from '@src/common/decorator/auth.decorator';
import { ArticleEntity } from '@src/entitys/article.entity';
import { GetTopicArticleListDto } from '@src/module/article/v1/dto/get-topic-article-list.dto';
import { GetClassifyListDto } from '@src/module/article/v1/dto/get-classify-list.dto';
import { TopicEntity } from '@src/entitys/topic.entity';

@ApiTags('文章模块')
@Controller('api/v1/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: '获取文章所有的分类' })
  @Get('classify/all')
  public async getArticleClassify(): Promise<ArticleClassifyEntity[]> {
    return this.articleService.getAllList();
  }

  @ApiOperation({
    summary: '通过文章分类id获取文章列表',
  })
  @Get('classify/list')
  public async getArticleListOfClassify(
    @Query() { classifyId, pageNum }: GetClassifyListDto,
  ): Promise<ArticleEntity[]> {
    return this.articleService.getArticleListOfClassify(+classifyId, +pageNum);
  }

  @ApiOperation({ summary: '通过话题id获取文章列表' })
  @Get('topic/list')
  public async getTopicList(
    @Query() { pageNum, topicId }: GetTopicArticleListDto,
  ): Promise<TopicEntity[]> {
    return await this.articleService.getTopicList(+topicId, +pageNum);
  }

  @ApiOperation({
    summary: '发布文章',
    description: 'ACId 和 isTopic 中最少需要有一个存在 ',
  })
  @ApiBearerAuth()
  @Post('publish')
  @Auth()
  public async postArticle(
    @Body() publishDto: PublishDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    await this.articleService.createArticle(publishDto, user);
  }

  @ApiOperation({ summary: '获取当前用户的文章列表' })
  @ApiBearerAuth()
  @Get('user/list')
  @Auth()
  public async getCurrentUserArticle(
    @CurrentUser() user: UsersEntity,
    @Query('pageNumber') pageNumber: string,
  ): Promise<ArticleEntity[]> {
    return this.articleService.getCurrentUserArticle(user, +pageNumber);
  }

  @ApiOperation({ summary: '获取指定的文章详情' })
  @Get('detail/:id')
  public async getArticleDetail(
    @Param('id') id: string,
  ): Promise<ArticleEntity> {
    return this.articleService.getArticleDetail(+id);
  }

  @ApiOperation({ summary: '获取指定用户的文章列表' })
  @Get('other/user/list')
  public async getUserArticle(
    @Query('id') id: string,
    @Query('pageNum') pageNum: string,
  ) {
    return this.articleService.getOtherUserArticle(+id, +pageNum);
  }

  @ApiOperation({
    summary: '通过文章id删除文章',
    description: '只能删除自己的',
  })
  @ApiBearerAuth()
  @Delete('/delete/:id')
  @Auth()
  public async deleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    await this.articleService.removeArticle(+id, user);
  }

  @ApiOperation({ summary: '搜索文章' })
  @Get('search')
  public async searchArticles(
    @Query('content') content: string,
  ): Promise<ArticleEntity> {
    return this.articleService.searchArticles(content);
  }
}
