import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import {
  Connection,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { ArticleEntity, ArticleType } from '@src/entitys/article.entity';
import { PublishDto } from '@src/module/article/v1/dto/publish.dto';
import { isNumber } from 'class-validator';
import { UsersEntity } from '@src/entitys/users.entity';
import { TopicEntity } from '@src/entitys/topic.entity';
import { TopicArticlesEntity } from '@src/entitys/topic_article.entity';
import {
  LikeType,
  UserArticleLikeEntity,
} from '@src/entitys/user-article-like.entity';
import { CommentEntity } from '@src/entitys/comment.entity';
import { GetTopIcType } from '@src/module/article/v1/dto/get-topic-article-list.dto';

export interface CreateArticle {
  title: string;
  pic: string;
  type: ArticleType;
  content: string;
  contentImg: string[];
  shareId: number;
  articleClassifyId: number;
  userId: number;
  address: string;
  videoUrl?: string;
  videoPic?: string;
}

export interface ICount {
  articleCount: number;
  topicArticleCount: number;
  commentCount: number;
  likeCount: number;
}

export const enum ClassifyType {
  Article, // 代表本条文章是文章分类下的文章
  Topic, // 代表本条是 话题下的文章
}
export const enum updateArticleLikeOrDisLikeCountType {
  add,
  remove,
}

@Injectable()
export class ArticleService {
  private logger: Logger = new Logger('ArticleClassifyService');

  private pageSize = 10;

  constructor(
    @InjectRepository(ArticleClassifyEntity)
    private readonly articleClassifyRepository: Repository<ArticleClassifyEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(TopicEntity)
    private readonly topicRepository: Repository<TopicEntity>,
    @InjectRepository(TopicArticlesEntity)
    private readonly topicArticlesRepository: Repository<TopicArticlesEntity>,
    @InjectRepository(UserArticleLikeEntity)
    private readonly userArticleLikeRepository: Repository<UserArticleLikeEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly connection: Connection,
  ) {}

  public async getAllList(): Promise<ArticleClassifyEntity[]> {
    try {
      return this.articleClassifyRepository
        .createQueryBuilder('a')
        .loadRelationCountAndMap('a.count', 'a.articles')
        .select()
        .getMany();
    } catch (err) {
      this.logger.error(err, '查询文章分类失败');
      throw new NewHttpException('查询文章分类失败', 400);
    }
  }

  public async createArticle(
    {
      type,
      ACId,
      shareId,
      contentImg,
      content,
      address,
      isTopic,
      topicId,
      videoUrl,
      videoPic,
    }: PublishDto,
    user: UsersEntity,
  ): Promise<void> {
    if (!isNumber(type) || isNaN(type) || (!isTopic && !ACId))
      throw new NewHttpException('参数错误');

    const title: string = content.slice(0, 10);
    const pic: string = contentImg ? contentImg[0] : null;

    const obj: CreateArticle = {
      title,
      pic,
      type,
      content,
      contentImg: contentImg || [],
      shareId: shareId || null,
      articleClassifyId: ACId || null,
      userId: user.id,
      address,
    };

    let createInfo: CreateArticle & ArticleEntity;

    switch (type) {
      case ArticleType.Graphic:
        // 处理图文
        try {
          createInfo = await this.articleRepository.save(obj);
        } catch (err) {
          this.logger.error(err, '插入数据库 图文出错');
          throw new NewHttpException('参数错误');
        }
        break;
      case ArticleType.PlainText:
        // 处理文字
        delete obj.pic;
        delete obj.contentImg;
        try {
          createInfo = await this.articleRepository.save(obj);
        } catch (err) {
          this.logger.error(err, '插入数据库 纯文字文章出错');
          throw new NewHttpException('参数错误');
        }
        break;
      case ArticleType.Share:
        if (shareId === 0) throw new NewHttpException('参数错误');
        // 处理分享
        if (isNumber(shareId) && shareId !== 0) {
          try {
            // 如果分享有图文
            if (pic !== null) {
              createInfo = await this.articleRepository.save(obj);
            } else {
              delete obj.pic;
              delete obj.contentImg;
              //  如果封面不存在意味着没有图片 是纯文本
              createInfo = await this.articleRepository.save(obj);
            }
          } catch (err) {
            this.logger.error(err, '插入数据库 分享文章报错');
            throw new NewHttpException('参数错误');
          }
        }
        break;
      case ArticleType.Video:
        if (!videoPic || !videoUrl) {
          throw new NewHttpException('参数错误');
        }

        obj.videoUrl = videoUrl;
        obj.videoPic = videoPic;
        try {
          await this.articleRepository.save({
            ...obj,
            video: { videoUrl, pic: videoPic, playCount: 0 },
          });
        } catch (err) {
          throw new NewHttpException('参数错误');
        }
        break;
      default:
    }

    // 如果是话题分类 就把关系建立
    if (isTopic === ClassifyType.Topic && topicId) {
      if (isTopic < 0 || isTopic > 1) throw new NewHttpException('参数错误');

      try {
        await this.topicArticlesRepository
          .createQueryBuilder()
          .insert()
          .values({ topicId, articleId: createInfo.id })
          .execute();
      } catch (err) {
        this.logger.error(err, '执行插入关系时出错');
        throw new NewHttpException('服务器错误', 500);
      }
    }
  }

  public async removeArticle(id: number, user: UsersEntity) {
    this.checkIsNaN(id);
    try {
      await this.articleRepository.delete({ id, userId: user.id });
    } catch (err) {
      this.logger.error(err, '删除文章失败');
      throw new NewHttpException('删除失败');
    }
  }

  public async getArticleListOfClassify(
    id: number,
    pageNumber: number,
    userId: number | null,
  ): Promise<ArticleEntity[]> {
    this.checkIsNaN(id);

    try {
      const query: SelectQueryBuilder<ArticleEntity> = this.articleList();
      if (userId) {
        query
          .leftJoinAndSelect(
            'art.userArticlesLikes',
            'userArticlesLikes',
            'userArticlesLikes.user_id = :userId',
            { userId },
          )
          .leftJoinAndSelect(
            'user.followed',
            'followed',
            'followed.user_id = :userId ',
            {
              userId,
            },
          );
      }

      return query
        .where('art.article-classify_id = :id', { id })
        .andWhere('art.privacy-status = 0')
        .orderBy('art.like_count_order', 'DESC')
        .offset((pageNumber - 1) * this.pageSize)
        .limit(this.pageSize)
        .getMany();
    } catch (err) {
      this.logger.error(err, '通过文章分类id获取文章列表出错');
      throw new NewHttpException('服务器内部错误', 500);
    }
  }

  public async getArticleDetail(
    articleId: number,
    userId: number | null,
  ): Promise<ArticleEntity> {
    this.checkIsNaN(articleId);

    const query: SelectQueryBuilder<ArticleEntity> = this.articleRepository
      .createQueryBuilder('art')
      .leftJoinAndSelect('art.user', 'users')
      .leftJoinAndSelect('users.userinfo', 'userinfo')
      .leftJoinAndSelect('art.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'u')
      .loadRelationCountAndMap('comment.replyCount', 'comment.reply')
      .leftJoinAndSelect('art.share', 'share')
      .loadRelationCountAndMap('art.commentCount', 'art.comments')
      .loadRelationCountAndMap(
        'art.likeCount',
        'art.userArticlesLikes',
        'like',
        (qb) => qb.where('like.isLike = 1'),
      )
      .loadRelationCountAndMap(
        'art.disLikeCount',
        'art.userArticlesLikes',
        'dislike',
        (qb) => qb.where('dislike.isLike = 0'),
      );

    if (userId) {
      query
        .leftJoinAndSelect(
          'art.userArticlesLikes',
          'userArticlesLikes',
          'userArticlesLikes.user_id = :userId',
          { userId },
        )
        .leftJoinAndSelect(
          'users.followed',
          'followed',
          'followed.user_id = :userId ',
          {
            userId,
          },
        );
    }
    return query.where('art.id = :articleId', { articleId }).getOne();
  }

  public async getTopicList(
    id: number,
    pageNumber: number,
    userId: number | null,
    type: GetTopIcType,
    // ): Promise<ArticleEntity[]> {
  ) {
    this.checkIsNaN(id, pageNumber);
    const pageNum: number = (pageNumber - 1) * this.pageSize;
    const query: SelectQueryBuilder<TopicEntity> = this.topicRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.articles', 'art')
      .leftJoinAndSelect('art.user', 'user')
      .leftJoinAndSelect('art.share', 'share')
      .leftJoinAndSelect('user.userinfo', 'userinfo')
      .loadRelationCountAndMap('art.commentCount', 'art.comments')
      .loadRelationCountAndMap(
        'art.likeCount',
        'art.userArticlesLikes',
        'like',
        (qb) => qb.where('like.isLike = 1'),
      )
      .loadRelationCountAndMap(
        'art.disLikeCount',
        'art.userArticlesLikes',
        'dislike',
        (qb) => qb.where('dislike.isLike = 0'),
      );
    if (userId) {
      // 如果登录了 就连接点赞表 看是否点赞了
      query
        .leftJoinAndSelect(
          'art.userArticlesLikes',
          'userArticlesLikes',
          'userArticlesLikes.user_id = :userId',
          { userId },
        )
        .leftJoinAndSelect(
          'user.followed',
          'followed',
          'followed.user_id = :userId ',
          {
            userId,
          },
        );
    }
    if (type === GetTopIcType.default) {
      query.orderBy('art.like_count_order', 'DESC');
    } else {
      query.orderBy('art.createAt', 'DESC');
    }
    return await query
      .where('a.id = :id', { id })
      .andWhere('art.privacy-status = 0')
      .offset(pageNum)
      .limit(this.pageSize)
      .getOne();
  }

  public async getCurrentUserArticle(
    user: UsersEntity,
    pageNumber: number,
  ): Promise<ArticleEntity[]> {
    this.checkIsNaN(pageNumber);
    const pageNum: number = (pageNumber - 1) * this.pageSize;
    return await this.articleList()
      .leftJoinAndSelect(
        'art.userArticlesLikes',
        'userArticlesLikes',
        'userArticlesLikes.user_id = :userId',
        { userId: user.id },
      )
      .leftJoinAndSelect(
        'user.followed',
        'followed',
        'followed.user_id = :userId ',
        {
          userId: user.id,
        },
      )
      .where('art.user_id = :id', { id: user.id })
      .orderBy('art.id', 'DESC')
      .limit(this.pageSize)
      .offset(pageNum)
      .getMany();
  }

  // 获取指定用户的文章列表
  public async getOtherUserArticle(
    id: number,
    pageNumber: number,
    userId: number | null,
  ): Promise<ArticleEntity[]> {
    this.checkIsNaN(id, pageNumber);
    const query = this.articleList();
    if (userId) {
      query
        .leftJoinAndSelect(
          'art.userArticlesLikes',
          'userArticlesLikes',
          'userArticlesLikes.user_id = :userId',
          {
            userId,
          },
        )
        .leftJoinAndSelect(
          'user.followed',
          'followed',
          'followed.user_id = :userId ',
          {
            userId,
          },
        );
    }

    return query
      .where('art.user_id = :id', { id })
      .andWhere('art.privacy-status = 0')
      .limit(this.pageSize)
      .offset((pageNumber - 1) * this.pageSize)
      .getMany();
  }

  // 搜索
  public async searchArticles(
    content: string,
    userId: number,
    pageNum: number,
  ): Promise<ArticleEntity[]> {
    const query: SelectQueryBuilder<ArticleEntity> = this.articleList();
    if (userId) {
      query
        .leftJoinAndSelect(
          'art.userArticlesLikes',
          'userArticlesLikes',
          'userArticlesLikes.user_id = :userId',
          { userId },
        )
        .leftJoinAndSelect(
          'user.followed',
          'followed',
          'followed.user_id = :userId ',
          {
            userId,
          },
        );
    }

    return query
      .offset((pageNum - 1) * this.pageSize)
      .limit(this.pageSize)
      .where('art.content like :name', { name: `%${content}%` })
      .andWhere('art.privacy-status = 0')
      .getMany();
  }

  // 点赞或点踩文章
  public async likeArticle(
    articleId: number,
    user: UsersEntity,
    type: LikeType,
  ): Promise<string> {
    if (articleId === 0) throw new NewHttpException('参数错误');
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    // 查询是否存在点赞或点踩
    const ifExists: UserArticleLikeEntity | undefined =
      await queryRunner.manager.findOne(UserArticleLikeEntity, {
        where: {
          userId: user.id,
          articleId,
        },
        lock: { mode: 'pessimistic_read' },
      });

    const article: ArticleEntity = await queryRunner.manager.findOne(
      ArticleEntity,
      articleId,
      {
        lock: { mode: 'pessimistic_read' },
      },
    );

    if (!article) throw new NewHttpException('文章不存在');

    try {
      if (ifExists) {
        // type=1 则点赞 =0点踩
        // 判断当前数据库中记录的和当前请求的type 是否一致 如果是一致的就删除这条记录
        if (type === ifExists.isLike) {
          //  删除记录
          await queryRunner.manager
            .createQueryBuilder()
            .delete()
            .from(UserArticleLikeEntity)
            .where('id = :id', { id: ifExists.id })
            .execute();
          await queryRunner.commitTransaction();
          return type === LikeType.like ? '取消喜欢成功' : '取消踩成功';
        } else {
          //  更新记录
          await queryRunner.manager
            .createQueryBuilder()
            .update(UserArticleLikeEntity)
            .set({ isLike: type })
            .where('article_id = :articleId', { articleId })
            .andWhere('user_id = :id', { id: user.id })
            .execute();
          await queryRunner.commitTransaction();
          return type === LikeType.like ? '喜欢成功' : '点踩成功';
        }
      } else {
        // 不存在
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(UserArticleLikeEntity)
          .values({ articleId, userId: user.id, isLike: type })
          .execute();
        await queryRunner.commitTransaction();
        return type === LikeType.like ? '喜欢成功' : '点踩成功';
      }
    } catch (err) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      this.logger.error(err, '点赞错误');
      throw new NewHttpException('未知错误 点赞失败');
    } finally {
      // 释放数据库事务
      await queryRunner.release();
      try {
        const articleLikeCount: number = await this.userArticleLikeRepository
          .createQueryBuilder('u')
          .where('u.is_like = 1')
          .andWhere('u.article_id = :articleId', { articleId })
          .getCount();
        await this.articleRepository
          .createQueryBuilder()
          .update()
          .set({ likeCountOrder: articleLikeCount })
          .where('id = :articleId', { articleId })
          .execute();
      } catch (err) {}
    }
  }
  //  获取个人所有的话题文章
  public async getUserTopicArticleList(
    userId: number,
    targetId: number,
    pageNum: number,
    // ): Promise<ArticleEntity[]> {
  ) {
    if (!userId && !targetId) throw new NewHttpException('参数错误');

    let id: number | undefined;
    if ((targetId && userId) || (targetId && !userId)) {
      id = targetId;
    }
    if (!targetId && userId) {
      id = userId;
    }
    return this.articleRepository
      .createQueryBuilder('art')
      .innerJoinAndSelect('art.topics', 'topics')
      .leftJoinAndSelect('art.user', 'user')
      .leftJoinAndSelect('user.userinfo', 'userinfo')
      .where('art.user_id = :id', { id })
      .offset((pageNum - 1) * this.pageSize)
      .limit(this.pageSize)
      .getMany();
    // return await this.topicRepository
    //   .createQueryBuilder('t')
    //   .leftJoinAndSelect('t.articles', 'articles')
    //   .where('articles.user_id = :userId', { userId: id })
    //   // .select('articles.*')
    //   .getMany();
    // ).map((item) => ({
    //   ...item,
    //   contentImgs: JSON.parse(item['content-imgs']),
    // }));
  }

  // 获取所有点赞的文章列表
  public async getLikeArticleList(
    userId: number,
  ): Promise<UserArticleLikeEntity[]> {
    return (
      await this.usersRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.userArticlesLikes', 'likes', 'likes.is_like = 1')
        .leftJoinAndSelect('likes.article', 'article')
        .where('u.id = :userId', { userId })
        .getOne()
    ).userArticlesLikes;
  }

  public async getCount(userId): Promise<ICount> {
    // 个人所有文章的数量
    const articleCount: number = await this.articleRepository
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .getCount();
    // 个人所有话题下的文章的数量
    const { topicArticleCount }: { topicArticleCount: string } =
      await this.topicRepository
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.articles', 'articles')
        .where('articles.user_id = :userId', { userId })
        .select('count(articles.id) topicArticleCount')
        .getRawOne();
    // 个人所有评论的数量
    const commentCount: number = await this.commentRepository
      .createQueryBuilder('c')
      .where('c.user_id = :userId', { userId })
      .getCount();
    // 个人所有点赞的数量
    const likeCount: number = await this.userArticleLikeRepository
      .createQueryBuilder('l')
      .where('l.user_id = :userId', { userId })
      .andWhere('l.is_like = 1')
      .getCount();
    return {
      articleCount,
      topicArticleCount: +topicArticleCount,
      commentCount,
      likeCount,
    };
  }

  public async getAllArticlesFollowedByUser(
    user: UsersEntity,
    pageNum: number,
  ): Promise<ArticleEntity[]> {
    // 要查当前用户所有关注的用户的文章
    const query = this.articleList();
    return query
      .leftJoinAndSelect(
        'art.userArticlesLikes',
        'userArticlesLikes',
        'userArticlesLikes.user_id = :userId',
        { userId: user.id },
      )
      .leftJoinAndSelect(
        'user.followed',
        'followed',
        'followed.user_id = :userId ',
        {
          userId: user.id,
        },
      )
      .orderBy('art.id', 'DESC')
      .offset((pageNum - 1) * this.pageSize)
      .limit(this.pageSize)
      .where('art.user_id = followed.follow_id')
      .andWhere('art.privacy-status = 0')
      .getMany();
  }

  private articleList() {
    return this.articleRepository
      .createQueryBuilder('art')
      .select()
      .leftJoinAndSelect('art.user', 'user')
      .leftJoinAndSelect('art.share', 'share')
      .leftJoinAndSelect('user.userinfo', 'userinfo')
      .loadRelationCountAndMap('art.commentCount', 'art.comments')
      .loadRelationCountAndMap(
        'art.likeCount',
        'art.userArticlesLikes',
        'like',
        (qb) => qb.where('like.isLike = 1'),
      )
      .loadRelationCountAndMap(
        'art.disLikeCount',
        'art.userArticlesLikes',
        'dislike',
        (qb) => qb.where('dislike.isLike = 0'),
      );
  }

  private checkIsNaN(...num: number[]) {
    num.forEach((item) => {
      if (isNaN(item)) throw new NewHttpException('参数错误');
    });
  }
}
