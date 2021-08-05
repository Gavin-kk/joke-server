import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '@src/entitys/comment.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from '@src/entitys/article.entity';
import { PostCommentDto } from '@src/module/comment/v1/dto/post-comment.dto';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { UsersEntity } from '@src/entitys/users.entity';
import { v4 as uuidUtil } from 'uuid';
import { ReplyEntity } from '@src/entitys/reply.entity';

@Injectable()
export class CommentService {
  private logger: Logger = new Logger();

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(ReplyEntity)
    private readonly replyRepository: Repository<ReplyEntity>,
  ) {}

  public async postAcomment(
    { content, targetId, articleId, commentId }: PostCommentDto,
    userId: number,
  ): Promise<string> {
    if (targetId === 0 || (targetId && !commentId))
      throw new NewHttpException('参数错误');
    // 判断回复的文章是否存在
    const articleIsExists: ArticleEntity | undefined =
      await this.articleRepository.findOne(articleId);
    if (!articleIsExists) throw new NewHttpException('文章不存在');

    try {
      if (commentId) {
        // 多级评论
        await this.replyRepository.save({
          commentId,
          content,
          targetId,
          userId,
        });
      } else {
        // 一级评论
        await this.commentRepository.save({
          content,
          articleId,
          userId,
        });
      }

      return '发布成功';
    } catch (err) {
      this.logger.error(err, '发布评论失败');
      throw new NewHttpException('发布文章失败');
    }
  }

  //  删除评论
  public async removeComment(
    commentId: number,
    userId: number,
  ): Promise<string> {
    //  找到评论
    const comment: CommentEntity | undefined =
      await this.commentRepository.findOne({
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

  public async getArticleCommentList(commentId: number) {
    return this.commentRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.reply', 'reply')
      .leftJoinAndSelect('reply.target', 'target')
      .leftJoinAndSelect('reply.user', 'lll')
      .leftJoinAndSelect('target.user', 'u')
      .where('c.id = :commentId', { commentId })
      .getOne();
  }

  test() {
    return this.commentRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.reply', 'replies')
      .getMany();
    // return this.replyRepository
    //   .createQueryBuilder('r')
    //   .leftJoinAndSelect('r.parentUu', 'uu')
    //   .leftJoinAndSelect('r.comment', 'comment')
    //   .where('comment.article_id = 3')
    //   .andWhere('uu.id = comment.id')
    //   .andWhere('r.target_moment_id is not null')
    //   .getMany();
  }
}
