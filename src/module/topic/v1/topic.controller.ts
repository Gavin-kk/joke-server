import { Controller, Get, Param } from '@nestjs/common';
import { TopicService } from './topic.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetTopicListDto } from './dto/get-topic-list.dto';
import { TopicEntity } from '@src/entitys/topic.entity';
import { TopicClassifyEntity } from '@src/entitys/topic-classify.entity';

@ApiTags('话题模块')
@Controller('api/v1/topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @ApiOperation({ summary: '获取所有话题分类' })
  @Get('classify/list')
  public async getAllClassify(): Promise<TopicClassifyEntity[]> {
    return this.topicService.getAllClassify();
  }

  @ApiOperation({ summary: '根据话题分类id获取话题分类下的话题列表' })
  @Get('classify/list/:id')
  public async getTopicList(
    @Param('id') id: string,
  ): Promise<TopicClassifyEntity[]> {
    return this.topicService.getTopicList(+id);
  }

  @ApiOperation({
    summary:
      '获取热门话题 限制10条, 未写完 待动态模块写完之后 在这里算谁的动态最多最新 取 10个优化!!!!!!!!!!!!!!!!!!',
  })
  @Get('popular/list')
  public async getPopularList(): Promise<TopicEntity[]> {
    return this.topicService.getPopularList();
  }
}
