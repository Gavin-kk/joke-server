import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '@src/entitys/comment.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from '@src/entitys/article.entity';
import { PostCommentDto } from '@src/module/comment/v1/dto/post-comment.dto';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { UsersEntity } from '@src/entitys/users.entity';

@Injectable()
export class CommentService {
  private logger: Logger = new Logger();

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  public async postAcomment(
    { content, targetId, articleId }: PostCommentDto,
    userId: number,
  ): Promise<string> {
    // 判断回复的文章是否存在
    const articleIsExists: ArticleEntity | undefined = await this.articleRepository.findOne(
      articleId,
    );

    if (!articleIsExists) throw new NewHttpException('文章不存在');
    if (targetId === 0) throw new NewHttpException('参数错误');
    try {
      await this.commentRepository.save({ content, targetId, articleId, userId });
      return '发布成功';
    } catch (err) {
      this.logger.error(err, '发布评论失败');
      throw new NewHttpException('发布文章失败');
    }
  }

  //  删除评论
  public async removeComment(commentId: number, userId: number): Promise<string> {
    //  找到评论
    const comment: CommentEntity | undefined = await this.commentRepository.findOne({
      id: commentId,
      userId,
    });
    console.log(userId);
    if (typeof comment === 'undefined') {
      throw new NewHttpException('评论不存在');
    }
    // 删除评论
    try {
      await this.commentRepository.delete({ id: comment.id, userId });
      return '删除成功';
    } catch (err) {
      this.logger.error(err, '删除评论出错');
    }
  }

  public async getUserCommentList(user: UsersEntity): Promise<CommentEntity[]> {
    try {
      return this.commentRepository
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.article', 'article')
        .where('c.user_id = :userId', { userId: user.id })
        .getMany();
    } catch (err) {
      this.logger.error(err, '获取个人评论列表出错');
      throw new NewHttpException('请求错误');
    }
  }
}
