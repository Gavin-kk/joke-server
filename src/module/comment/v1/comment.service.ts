import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from '@src/entitys/comment.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from '@src/entitys/article.entity';
import { PostCommentDto } from '@src/module/comment/v1/dto/post-comment.dto';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { UsersEntity } from '@src/entitys/users.entity';
import { ReplyEntity } from '@src/entitys/reply.entity';
import { UserCommentLikeEntity } from '@src/entitys/user-comment-like.entity';
import {
  LikeCommentDto,
  LikeCommentType,
} from '@src/module/comment/v1/dto/like-comment.dto';

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
    @InjectRepository(UserCommentLikeEntity)
    private readonly userCommentLikeRepository: Repository<UserCommentLikeEntity>,
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

  public async getArticleCommentList(commentId: number, userId?: number) {
    const query = this.commentRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.reply', 'reply')
      .loadRelationCountAndMap('c.commentLikeCount', 'reply.userCommentLikes')
      .leftJoinAndSelect('reply.target', 'target')
      .leftJoinAndSelect('reply.user', 'lll')
      .leftJoinAndSelect('target.user', 'u');
    if (typeof userId !== 'undefined' && !isNaN(userId)) {
      query.loadRelationCountAndMap(
        'reply.isLike',
        'reply.userCommentLikes',
        's',
        (qb) => qb.where('s.user_id = :userId', { userId }),
      );
    }
    return query.where('c.id = :commentId', { commentId }).getOne();
  }

  public async likeComment(
    { type, commentId }: LikeCommentDto,
    user: UsersEntity,
  ) {
    try {
      if (type === LikeCommentType.firstLevelComment) {
        // 查询是否存在评论
        const isExistsComment: CommentEntity | undefined =
          await this.commentRepository.findOne({
            id: commentId,
          });
        if (typeof isExistsComment === 'undefined') {
          throw new Error('评论不存在');
        }
        // 查询是否已经点赞了
        const isExists: UserCommentLikeEntity | undefined =
          await this.userCommentLikeRepository.findOne({
            userId: user.id,
            commentId,
          });
        if (typeof isExists !== 'undefined') {
          await this.userCommentLikeRepository.delete({
            userId: user.id,
            commentId,
          });
          return '取消点赞成功';
        } else {
          await this.userCommentLikeRepository.save({
            commentId,
            userId: user.id,
          });
          return '点赞成功';
        }
      } else if (type === LikeCommentType.secondaryComment) {
        // 查询是否存在评论
        const isExistsComment: ReplyEntity | undefined =
          await this.replyRepository.findOne({
            id: commentId,
          });
        if (typeof isExistsComment === 'undefined') {
          throw new Error('评论不存在');
        }
        // 查询是否已经点赞了
        const isExists: UserCommentLikeEntity | undefined =
          await this.userCommentLikeRepository.findOne({
            userId: user.id,
            replyId: commentId,
          });
        if (typeof isExists !== 'undefined') {
          await this.userCommentLikeRepository.delete({
            userId: user.id,
            replyId: commentId,
          });
          return '取消点赞成功';
        } else {
          await this.userCommentLikeRepository.save({
            replyId: commentId,
            userId: user.id,
          });
          return '点赞成功';
        }
      }
    } catch (err) {
      this.logger.error(err, '评论点赞错误');
      throw new NewHttpException(err.message);
    }
  }
}
