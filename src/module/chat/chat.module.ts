import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { ChatEntity } from '@src/entitys/chat.entity';
import { FollowService } from '@src/module/follow/v1/follow.service';
import { FollowModule } from '@src/module/follow/v1/follow.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UsersEntity, ChatEntity]),
    FollowModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
})
export class ChatModule {}
