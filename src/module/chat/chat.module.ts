import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([UsersEntity])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
