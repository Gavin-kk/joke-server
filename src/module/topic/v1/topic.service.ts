import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { TopicEntity } from '@src/entitys/topic.entity';
import { isEmpty } from 'class-validator';
import { CreateTopicDto } from '@src/module/topic/v1/dto/create-topic.dto';
import * as Moment from 'moment';
import { TopicArticlesEntity } from '@src/entitys/topic_article.entity';
import { ArticleEntity } from '@src/entitys/article.entity';

@Injectable()
export class TopicService {
  private logger: Logger = new Logger('TopicService');

  constructor(
    @InjectRepository(TopicClassifyEntity)
    private readonly topicClassifyRepository: Repository<TopicClassifyEntity>,
    @InjectRepository(TopicEntity)
    private readonly topicRepository: Repository<TopicEntity>,
  ) {}

  public async createTopic({
    title,
    TCId,
    imageUrl,
    desc,
  }: CreateTopicDto): Promise<void> {
    await this.topicRepository.save({
      title,
      desc,
      topicClassifyId: TCId,
      pic: imageUrl,
    });
  }

  public async getAllClassify(): Promise<TopicClassifyEntity[]> {
    try {
      return this.topicClassifyRepository.createQueryBuilder().getMany();
    } catch (err) {
      this.logger.error(err, '获取分类列表失败');
      throw new NewHttpException('获取分类列表失败', 400);
    }
  }

  // public async getTopicList(id: number): Promise<TopicClassifyEntity[]> {
  public async getTopicList(id: number, pageNum?: number) {
    if (isNaN(id) || isNaN(pageNum)) {
      throw new NewHttpException('参数类型错误');
    }
    const pageSize = 10;

    try {
      return (
        await this.topicClassifyRepository
          .createQueryBuilder('t')
          .select()
          .leftJoinAndSelect('t.topics', 'topic')
          .loadRelationCountAndMap('t.articleCount', 'topic.articles')
          .loadRelationCountAndMap(
            't.todayCount',
            'topic.articles',
            'todayCount',
            (qb) =>
              qb.where(
                `to_days(todayCount.createAt) = to_days("${Moment().format(
                  'YYYY-MM-DD',
                )}")`,
              ),
          )
          .where((qb: SelectQueryBuilder<TopicClassifyEntity>): string => {
            const subQuery: string = qb
              .subQuery()
              .createQueryBuilder()
              .select(['topic.id'])
              .from(TopicEntity, 'topic')
              .orderBy('topic.id', 'ASC')
              .offset((pageNum - 1) * pageSize)
              .limit(1)
              .getQuery();
            return `topic.id >= (${subQuery})`;
          })
          .andWhere('t.id = :id', { id })
          .limit(pageSize)
          .getOne()
      ).topics;
    } catch (err) {
      this.logger.error(err, 'getTopicList出错');
      throw new NewHttpException('请求错误');
    }
  }

  public async getPopularList() {
    const result = await this.topicRepository
      .createQueryBuilder('t')
      .leftJoin('t.articles', 'articles')
      .loadRelationCountAndMap(
        't.todayCount',
        't.articles',
        'todayCount',
        (qb) =>
          qb.where(
            `to_days(todayCount.createAt) = to_days("${Moment().format(
              'YYYY-MM-DD',
            )}")`,
          ),
      )
      .addSelect('count(articles.id)', 'articleCount')
      .groupBy('t.id')
      .orderBy('articleCount', 'DESC')
      .limit(10)
      .offset(0)
      .getRawAndEntities();

    const articleCountArr: number[] = result.raw.map(
      (item) => +item.articleCount,
    );
    return result.entities.map((item, index) => ({
      ...item,
      articleCount: articleCountArr[index],
    }));
  }
  // 搜索话题
  public async searchTopic(content = '', pageNum: number) {
    if (isEmpty(content)) throw new NewHttpException('参数错误');
    return this.topicRepository
      .createQueryBuilder('t')
      .where('t.title like :name', { name: `%${content}%` })
      .offset(0)
      .limit(pageNum * 10)
      .getMany();
  }

  public async getAllTopic(pageNum: number) {
    const pageSize = 10;
    return this.topicRepository
      .createQueryBuilder('topic')
      .loadRelationCountAndMap('topic.articleCount', 'topic.articles')
      .loadRelationCountAndMap(
        'topic.todayCount',
        'topic.articles',
        'todayCount',
        (qb) =>
          qb.where(
            `to_days(todayCount.createAt) = to_days("${Moment().format(
              'YYYY-MM-DD',
            )}")`,
          ),
      )
      .offset(0)
      .limit(pageNum * pageSize)
      .getMany();
  }

  public async getTopicDetails(topicId: number): Promise<TopicEntity> {
    return await this.topicRepository
      .createQueryBuilder('topic')
      .loadRelationCountAndMap('topic.articleCount', 'topic.articles')
      .loadRelationCountAndMap(
        'topic.todayCount',
        'topic.articles',
        'todayCount',
        (qb) =>
          qb.where(
            `to_days(todayCount.createAt) = to_days("${Moment().format(
              'YYYY-MM-DD',
            )}")`,
          ),
      )
      .where('topic.id = :topicId', { topicId })
      .getOne();
  }
}
