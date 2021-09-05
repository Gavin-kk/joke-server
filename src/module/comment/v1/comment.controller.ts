import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { PostCommentDto } from '@src/module/comment/v1/dto/post-comment.dto';
import { Auth } from '@src/common/decorator/auth.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { UsersEntity } from '@src/entitys/users.entity';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import { checkId } from '@src/module/comment/v1/dto/comment.schema';
import { CommentEntity } from '@src/entitys/comment.entity';
import { GetArticleCommentListDto } from '@src/module/comment/v1/dto/get-article-comment-list.dto';
import { LikeCommentDto } from '@src/module/comment/v1/dto/like-comment.dto';
import { CurrentUserId } from '@src/common/decorator/current-userId.decorator';

@ApiTags('文章评论模块')
@Controller('api/v1/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({
    summary: '文章发布评论接口',
    description:
      'commentId:回复评论的一级评论id 为空或者不传 就是回复文章的一级评论 content: 评论的内容 targetId是回复评论的id 可以不传 如果不为空 需要传入一级评论的commentId 如果是回复一级评论或其下的评论 articleId 可以不传',
  })
  @ApiBearerAuth()
  @Post('publish')
  @Auth()
  public async postAComment(
    @Body() postCommentDto: PostCommentDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<string> {
    return this.commentService.postAcomment(postCommentDto, user.id);
  }

  @ApiOperation({
    summary: '获取文章的一级评论下的所有评论',
    description: 'commentId 一级评论的id 查询此id下的所有评论',
  })
  @Get('list')
  public async getArticleCommentList(
    @Query() { commentId }: GetArticleCommentListDto,
    @CurrentUserId() userId: number,
  ) {
    return this.commentService.getArticleCommentList(+commentId, userId);
  }

  @ApiOperation({
    summary: '删除评论接口',
    description: '传入评论的id 需要登录 删自己的',
  })
  @ApiBearerAuth()
  @Delete('delete/:commentId')
  @Auth()
  @UsePipes()
  public async removeComment(
    @Param('commentId', new LineCheckTransformPipe(checkId)) commentId: number,
    @CurrentUser() user: UsersEntity,
  ): Promise<string> {
    return this.commentService.removeComment(commentId, user.id);
  }

  @ApiOperation({ summary: '获取个人所有评论 携带文章的信息' })
  @ApiBearerAuth()
  @Get('user/list')
  @Auth()
  public async getUserCommentList(
    @CurrentUser() user: UsersEntity,
  ): Promise<CommentEntity[]> {
    return this.commentService.getUserCommentList(user);
  }

  @ApiOperation({ summary: '点赞评论接口' })
  @ApiBearerAuth()
  @Post('like/comment')
  @Auth()
  public async likeComment(
    @CurrentUser() user: UsersEntity,
    @Body() likeCommentDto: LikeCommentDto,
  ): Promise<'点赞成功' | '取消点赞成功'> {
    return this.commentService.likeComment(likeCommentDto, user);
  }
}
