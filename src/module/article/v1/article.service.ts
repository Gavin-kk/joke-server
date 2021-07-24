import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { Repository } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { ArticleEntity, ArticleType } from '@src/entitys/article.entity';
import { PublishDto } from '@src/module/article/v1/dto/publish.dto';
import { isNumber } from 'class-validator';
import { UsersEntity } from '@src/entitys/users.entity';
import { TopicEntity } from '@src/entitys/topic.entity';
import { TopicArticlesEntity } from '@src/entitys/topic_articles_article.entity';

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
  isTopic: ClassifyType;
}

export const enum ClassifyType {
  Article, // 代表本条文章是文章分类下的文章
  Topic, // 代表本条是 话题下的文章
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
  ) {}

  public async getAllList(): Promise<ArticleClassifyEntity[]> {
    try {
      return this.articleClassifyRepository
        .createQueryBuilder()
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
      contentImg,
      shareId: shareId || null,
      articleClassifyId: ACId || null,
      userId: user.id,
      address,
      isTopic,
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
  ): Promise<ArticleEntity[]> {
    this.checkIsNaN(id);

    try {
      return this.articleList()
        .orderBy('art.like-count', 'DESC')
        .where('art.article-classify_id = :id', { id })
        .andWhere('art.privacy-status = 0')
        .offset((pageNumber - 1) * this.pageSize) // offset
        .limit(this.pageSize) // limit
        .getMany();
    } catch (err) {
      this.logger.error(err, '通过文章分类id获取文章列表出错');
      throw new NewHttpException('服务器内部错误', 500);
    }
  }

  public async getArticleDetail(id: number) {
    this.checkIsNaN(id);

    return this.articleRepository
      .createQueryBuilder('c')
      .select()
      .leftJoinAndSelect('c.user', 'users')
      .leftJoinAndSelect('users.userinfo', 'userinfo')
      .leftJoinAndSelect('c.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'u')
      .where('c.id = :id', { id })
      .getOne();
  }

  public async getTopicList(
    id: number,
    pageNumber: number,
  ): Promise<TopicEntity[]> {
    this.checkIsNaN(id, pageNumber);
    const pageNum: number = (pageNumber - 1) * this.pageSize;

    return this.topicRepository
      .createQueryBuilder('a')
      .select()
      .leftJoinAndSelect('a.articles', 'art')
      .leftJoinAndSelect('art.user', 'user')
      .leftJoinAndSelect('art.share', 'share')
      .leftJoinAndSelect('user.userinfo', 'userinfo')
      .loadRelationCountAndMap('art.comment-count', 'art.comments')
      .where('a.id = :id', { id })
      .andWhere('art.privacy-status = 0')
      .limit(this.pageSize)
      .offset(pageNum)
      .getMany();
  }

  public async getCurrentUserArticle(user: UsersEntity, pageNumber: number) {
    this.checkIsNaN(pageNumber);
    const pageNum: number = (pageNumber - 1) * this.pageSize;

    return this.articleRepository
      .createQueryBuilder('a')
      .select()
      .where('a.user_id = :id', { id: user.id })
      .orderBy('a.id', 'DESC')
      .limit(this.pageSize)
      .offset(pageNum)
      .getMany();
  }

  // 获取指定用户的文章列表
  public async getOtherUserArticle(id: number, pageNumber: number) {
    this.checkIsNaN(id, pageNumber);
    return this.articleList()
      .where('art.user_id = :id', { id })
      .andWhere('art.privacy-status = 0')
      .limit(this.pageSize)
      .offset((pageNumber - 1) * this.pageSize)
      .getMany();
  }

  // 搜索
  public async searchArticles(content: string) {
    if (!content) throw new NewHttpException('参数错误');
    return this.articleRepository
      .createQueryBuilder('art')
      .select()
      .where('art.title like :name', { name: `%${content}%` })
      .andWhere('art.privacy-status = 0')
      .getOne();
  }

  private articleList() {
    return this.articleRepository
      .createQueryBuilder('art')
      .select()
      .leftJoinAndSelect('art.user', 'user')
      .leftJoinAndSelect('art.share', 'share')
      .leftJoinAndSelect('user.userinfo', 'userinfo')
      .loadRelationCountAndMap('art.comment-count', 'art.comments');
  }

  private checkIsNaN(...num: number[]) {
    num.forEach((item) => {
      if (isNaN(item)) throw new NewHttpException('参数错误');
    });
  }
}
