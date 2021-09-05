import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@src/common/decorator/auth.decorator';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { UserFeedbackDto } from '@src/module/feedback/v1/dto/user-feedback.dto';
import { RolesGuard } from '@src/common/guard/roles.guard';
import { Roles } from '@src/common/decorator/role.decorator';
import { FeedbackEntity } from '@src/entitys/feedback.entity';

@ApiTags('反馈模块')
@Controller('api/v1/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({
    summary: '用户反馈建议',
    description: '参数详情 :UserFeedbackDto',
  })
  @ApiBearerAuth()
  @Post()
  @Auth()
  public async userFeedback(
    @Body() { content }: UserFeedbackDto,
    @CurrentUser('id') userId: number,
  ): Promise<void> {
    return this.feedbackService.userFeedback(content, userId);
  }

  @ApiOperation({ summary: '获取用户反馈内容列表 仅管理员可访问' })
  @ApiBearerAuth()
  @Get('list')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Auth()
  public async getAListOfFeedbackSuggestions(): Promise<FeedbackEntity[]> {
    return this.feedbackService.getFeedbackList();
  }
}
