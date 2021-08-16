import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';
import { WsException } from '@nestjs/websockets';
import { ChatEntity } from '@src/entitys/chat.entity';
import { IChatMsg } from '@src/module/chat/ws.interface';
import { FollowService } from '@src/module/follow/v1/follow.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    private followService: FollowService,
  ) {}

  // 检查用户是否存在
  public async checkUserIsExists(targetUserId: number): Promise<void> {
    const isExists = !!(await this.usersRepository.findOne(targetUserId));
    if (!isExists) {
      throw new WsException('不存在目标用户');
    }
  }
  // 检查是否相互关注
  public async checkWhetherToPayAttentionToEachOther(
    targetUserId: number,
    currentUsreId: number,
  ) {
    const isFollowEachOther = await this.followService.getMutualList(
      currentUsreId,
    );
    const findIndex: number | -1 = isFollowEachOther.findIndex(
      (item) => item.id === targetUserId,
    );
    if (findIndex === -1) {
      throw new WsException('没有互相关注呦，需要互相关注才能发送消息呦');
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
