import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';
import { WsException } from '@nestjs/websockets';
import { ChatEntity } from '@src/entitys/chat.entity';
import { IChatMsg } from '@src/module/chat/ws.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  // 检查用户是否存在
  public async checkUserIsExists(userId: number): Promise<void> {
    const isExists = !!(await this.usersRepository.findOne(userId));
    if (!isExists) {
      throw new WsException('不存在目标用户');
    }
  }
  // 保存离线消息
  public async saveOfflineMessage(save: IChatMsg) {
    await this.chatRepository.save(save);
  }
  // 获取所有离线未读消息
  public async getOfflineMsg(userId: number): Promise<ChatEntity[]> {
    return this.chatRepository.find({ targetUserId: userId });
  }
  //   删除离线消息
  public async removeOfflineMsg(userId: number) {
    await this.chatRepository.delete({ targetUserId: userId });
  }
}
