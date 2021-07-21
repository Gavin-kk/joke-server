import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';
import { Repository } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { TopicEntity } from '@src/entitys/topic.entity';

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

  public async getTopicList(id: number): Promise<TopicClassifyEntity[]> {
    try {
      return this.topicClassifyRepository
        .createQueryBuilder('t')
        .select()
        .leftJoinAndSelect('t.topics', 'topic')
        .where('t.id = :id', { id })
        .getMany();
    } catch (err) {
      this.logger.error(err, 'getTopicList出错');
      throw new NewHttpException('请求错误');
    }
  }

  public async getPopularList(): Promise<TopicEntity[]> {
    return this.topicRepository.createQueryBuilder().limit(10).getMany();
  }
}
