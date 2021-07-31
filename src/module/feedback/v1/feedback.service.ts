import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackEntity } from '@src/entitys/feedback.entity';
import { Repository } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';

@Injectable()
export class FeedbackService {
  private logger: Logger = new Logger();
  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
  ) {}

  public async userFeedback(content: string, userId: number): Promise<void> {
    try {
      await this.feedbackRepository.save({ content, userId });
    } catch (err) {
      this.logger.error(err, '用户反馈出错');
      throw new NewHttpException('反馈出错');
    }
  }

  public async getFeedbackList(): Promise<FeedbackEntity[]> {
    return this.feedbackRepository.find();
  }
}
