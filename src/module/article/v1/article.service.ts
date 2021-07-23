import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleClassifyEntity } from '@src/entitys/article-classify.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { ArticleEntity, ArticleType } from '@src/entitys/article.entity';
import { CommentEntity } from '@src/entitys/comment.entity';
import { PublishDto } from '@src/module/article/v1/dto/publish.dto';
import { isNumber } from 'class-validator';
import { UsersEntity } from '@src/entitys/users.entity';

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
}

@Injectable()
export class ArticleService {
  private logger: Logger = new Logger('ArticleClassifyService');

  constructor(
    @InjectRepository(ArticleClassifyEntity)
    private readonly articleClassifyRepository: Repository<ArticleClassifyEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  public async getAllList(): Promise<ArticleClassifyEntity[]> {
    try {
      return this.articleClassifyRepository
        .createQueryBuilder()
        .select(['a.id', 'a.title'])
        .from(ArticleClassifyEntity, 'a')
        .getMany();
    } catch (err) {
      this.logger.error(err, '查询文章分类失败');
      throw new NewHttpException('查询文章分类失败', 400);
    }
  }

  public async createArticle(
    { type, ACId, shareId, contentImg, content, address }: PublishDto,
    user: UsersEntity,
  ): Promise<void> {
    if (!isNumber(type) || isNaN(type) || ACId === 0)
      throw new NewHttpException('请求错误');

    const title: string = content.slice(0, 10);
    const pic: string = contentImg ? contentImg[0] : null;

    const obj: CreateArticle = {
      title,
      pic,
      type,
      content,
      contentImg,
      shareId: shareId || null,
      articleClassifyId: ACId,
      userId: user.id,
      address,
    };

    switch (type) {
      case ArticleType.Graphic:
        // 处理图文
        try {
          await this.articleRepository.save(obj);
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
          await this.articleRepository.save(obj);
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
              await this.articleRepository.save(obj);
            } else {
              delete obj.pic;
              delete obj.contentImg;
              //  如果封面不存在意味着没有图片 是纯文本
              await this.articleRepository.save(obj);
            }
          } catch (err) {
            this.logger.error(err, '插入数据库 分享文章报错');
            throw new NewHttpException('参数错误');
          }
        }
        break;
      default:
    }
  }

  public async removeArticle(id: number, user: UsersEntity): Promise<void> {
    if (isNaN(id)) throw new NewHttpException('参数错误');
    try {
      await this.articleRepository.delete({ id, userId: user.id });
    } catch (err) {
      this.logger.error(err, '删除文章失败');
      throw new NewHttpException('删除失败');
    }
  }

  public async getArticleListOfClassify(id: number): Promise<ArticleEntity[]> {
    if (isNaN(id)) throw new NewHttpException('参数错误');
    try {
      return this.articleRepository
        .createQueryBuilder('c')
        .select()
        .orderBy('c.like-count', 'DESC')
        .leftJoinAndSelect('c.user', 'users')
        .leftJoinAndSelect('c.share', 'share')
        .loadRelationCountAndMap('c.comment-count', 'c.comments') // 计算comment表中与本表有关联的数量 字段映射为 comment-count
        .where('c.article-classify_id = :id', { id })
        .getMany();
    } catch (err) {
      this.logger.error(err, '通过文章分类id获取文章列表出错');
      throw new NewHttpException('服务器内部错误', 500);
    }
  }

  public async getArticleDetail(id: number) {
    if (isNaN(id)) throw new NewHttpException('参数错误');
    return this.articleRepository
      .createQueryBuilder('c')
      .select()
      .leftJoinAndSelect('c.user', 'users')
      .leftJoinAndSelect('c.comments', 'comment')
      .leftJoinAndSelect('comment.user', 'u')
      .where('c.id = :id', { id })
      .getOne();
  }
}
