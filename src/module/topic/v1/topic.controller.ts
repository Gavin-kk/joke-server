import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { TopicService } from './topic.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TopicEntity } from '@src/entitys/topic.entity';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import * as joi from 'joi';
const schema = joi.number().required();

@ApiTags('话题模块')
@Controller('api/v1/topic')
export class TopicController {
  private logger: Logger = new Logger('TopicController');
  constructor(private readonly topicService: TopicService) {}

  @ApiOperation({ summary: '获取所有话题分类' })
  @Get('classify/list')
  public async getAllClassify(): Promise<TopicClassifyEntity[]> {
    return this.topicService.getAllClassify();
  }

  @ApiOperation({
    summary: '根据话题分类id获取话题分类下的话题列表',
    description:
      '动态路由 第一个参数是父分类的id 第二个是话题列表的分页参数pageNum',
  })
  @Get('classify/:classifyId')
  public async getTopicList(
    @Param('classifyId')
    classifyId: string,
    @Query('pageNum') pageNum: string,
  ): Promise<TopicClassifyEntity> {
    return this.topicService.getTopicList(+classifyId, +pageNum);
  }

  @ApiOperation({
    summary:
      '获取热门话题 限制10条, 未写完 待动态模块写完之后 在这里算谁的动态最多最新 取10个优化!!!!!!!!!!!!!!!!!!',
  })
  @Get('popular/list')
  public async getPopularList(): Promise<TopicEntity[]> {
    return this.topicService.getPopularList();
  }

  @ApiOperation({ summary: '搜索话题' })
  @Get('search')
  public async searchTopic(
    @Query('content') content: string,
    @Query('pageNum', new LineCheckTransformPipe(schema)) pageNum: number,
  ): Promise<TopicEntity[]> {
    return this.topicService.searchTopic(content, pageNum);
  }

  @ApiOperation({ summary: '获取所有话题 分页' })
  @Get('all')
  public async getAllTopics(
    @Query('pageNum', new LineCheckTransformPipe(schema)) pageNum: number,
  ) {
    return this.topicService.getAllTopic(pageNum);
  }
}
