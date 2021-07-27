import { Body, Controller, Delete, Get, Param, Post, UsePipes } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PostCommentDto } from '@src/module/comment/v1/dto/post-comment.dto';
import { Auth } from '@src/common/decorator/auth.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { UsersEntity } from '@src/entitys/users.entity';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import { checkId } from '@src/module/comment/v1/dto/comment.schema';

@ApiTags('文章评论模块')
@Controller('api/v1/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({
    summary: '文章发布评论接口',
    description: 'targetId:回复评论的id 为空或者不传 就是回复文章的一级评论 content: 评论的内容',
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
}
