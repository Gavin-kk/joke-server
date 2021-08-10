import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { TopicEntity } from '@src/entitys/topic.entity';
import { isEmpty } from 'class-validator';

@Injectable()
export class TopicService {
  private logger: Logger = new Logger('TopicService');

  constructor(
    @InjectRepository(TopicClassifyEntity)
    private readonly topicClassifyRepository: Repository<TopicClassifyEntity>,
    @InjectRepository(TopicEntity)
    private readonly topicRepository: Repository<TopicEntity>,
  ) {}

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
      return this.topicClassifyRepository
        .createQueryBuilder('t')
        .select()
        .leftJoinAndSelect('t.topics', 'topic')
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
        .limit(pageSize)
        .getOne();
    } catch (err) {
      this.logger.error(err, 'getTopicList出错');
      throw new NewHttpException('请求错误');
    }
  }

  public async getPopularList(): Promise<TopicEntity[]> {
    return this.topicRepository.createQueryBuilder().limit(10).getMany();
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
      .createQueryBuilder()
      .offset(0)
      .limit(pageNum * pageSize)
      .getMany();
  }
}
