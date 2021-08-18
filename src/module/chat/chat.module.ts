import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { ChatEntity } from '@src/entitys/chat.entity';
import { FollowModule } from '@src/module/follow/v1/follow.module';
import { AttentionCountEntity } from '@src/entitys/attention-count.entity';
import { LikeCountEntity } from '@src/entitys/like-count.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UsersEntity,
      ChatEntity,
      AttentionCountEntity,
      LikeCountEntity,
    ]),
    forwardRef(() => FollowModule),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
})
export class ChatModule {}
