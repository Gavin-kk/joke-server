import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { TopicEntity } from '@src/entitys/topic.entity';
import { Worker } from 'worker_threads';
import { join } from 'path';

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
      return this.topicClassifyRepository
        .createQueryBuilder('TopicClassifyEntity')
        .select(['TopicClassifyEntity.id', 'TopicClassifyEntity.title'])
        .getMany();
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
}
