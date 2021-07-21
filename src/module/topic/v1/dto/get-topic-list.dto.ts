import { IsEmpty } from 'class-validator';

export class GetTopicListDto {
  @IsEmpty({ message: 'id是必须的' })
  id: string;
}
