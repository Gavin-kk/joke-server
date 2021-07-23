import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublishDto } from './dto/publish.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { UsersEntity } from '@src/entitys/users.entity';

@ApiTags('文章模块')
@Controller('api/v1/article')
export class ArticleController {
  constructor(private readonly articleClassifyService: ArticleService) {}

  @ApiOperation({ summary: '获取文章所有的分类' })
  @Get('classify/list')
  public async getArticleClassify(): Promise<ArticleClassifyEntity[]> {
    return this.articleClassifyService.getAllList();
  }

  @ApiOperation({ summary: '发布文章' })
  @ApiBearerAuth()
  @Post('publish')
  @UseGuards(AuthGuard('jwt'))
  public async postArticle(
    @Body() publishDto: PublishDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.articleClassifyService.createArticle(publishDto, user);
  }
}
