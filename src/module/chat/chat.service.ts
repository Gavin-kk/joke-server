import { Injectable, Logger } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';
import { WsException } from '@nestjs/websockets';
import { ChatEntity } from '@src/entitys/chat.entity';
import { IChatMsg, IWs } from '@src/module/chat/ws.interface';
import { FollowService } from '@src/module/follow/v1/follow.service';
import { AttentionCountEntity } from '@src/entitys/attention-count.entity';
import { LikeCountEntity } from '@src/entitys/like-count.entity';

@Injectable()
export class ChatService {
  private logger: Logger = new Logger();
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(AttentionCountEntity)
    private readonly attentionCountRepository: Repository<AttentionCountEntity>,
    @InjectRepository(LikeCountEntity)
    private readonly likeCountRepository: Repository<LikeCountEntity>,
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
    time: number,
    content: string,
    currentClient: IWs,
  ) {
    const isFollowEachOther = await this.followService.getMutualList(
      currentUsreId,
    );
    const findIndex: number | -1 = isFollowEachOther.findIndex(
      (item) => item.id === targetUserId,
    );
    if (findIndex === -1) {
      currentClient.send(
        JSON.stringify({
          event: 'noMutualRelations',
          data: {
            msg: `没有互相关注呦，需要互相关注才能发送消息呦-`,
            id: `${time}$${content}`,
            targetUserId,
          },
        }),
      );
    }
  }

  // 查找离线时的关注请求
  public async findFollowingRequestsWhileOffline(userId: number) {
    try {
      return this.attentionCountRepository.findOne({ targetUserId: userId });
    } catch (err) {
      this.logger.error(err, '查找离线时的关注请求出错');
    }
  }

  // 保存离线时的关注请求
  public async saveFollowingRequestsWhileOffline(targetUserId: number) {
    try {
      const isExists: AttentionCountEntity | undefined =
        await this.attentionCountRepository.findOne({ targetUserId });

      if (typeof isExists === 'undefined') {
        await this.attentionCountRepository.save({ count: 1, targetUserId });
      } else {
        await this.attentionCountRepository.update(
          {
            targetUserId,
          },
          { count: ++isExists.count },
        );
      }
    } catch (err) {
      this.logger.error(err, '保存离线时的关注请求出错');
    }
  }
  // 删除离线时的关注请求
  public async RemoveFollowingRequestsWhileOffline(targetUserId: number) {
    try {
      await this.attentionCountRepository.delete({ targetUserId });
    } catch (err) {
      this.logger.error(err, '删除离线时的关注请求出错');
    }
  }

  // 保存离线消息
  public async saveOfflineMessage(save: IChatMsg) {
    try {
      await this.chatRepository.save(save);
    } catch (err) {
      this.logger.error(err, '保存离线消息出错');
    }
  }

  // 获取所有离线未读消息
  public async getOfflineMsg(userId: number): Promise<ChatEntity[]> {
    try {
      return this.chatRepository.find({ targetUserId: userId });
    } catch (err) {
      this.logger.error(err, '获取所有离线未读消息出错');
    }
  }

  //   删除离线消息
  public async removeOfflineMsg(userId: number) {
    try {
      await this.chatRepository.delete({ targetUserId: userId });
    } catch (err) {
      this.logger.error(err, '删除离线消息出错');
    }
  }

  // 保存离线时的点赞数量
  public async saveTheNumberOfLikesWhenOffline(targetUserId: number) {
    try {
      const isExists: LikeCountEntity | undefined =
        await this.likeCountRepository.findOne({ targetUserId });

      if (typeof isExists === 'undefined') {
        await this.attentionCountRepository.save({ count: 1, targetUserId });
      } else {
        await this.attentionCountRepository.update(
          {
            targetUserId,
          },
          { count: ++isExists.count },
        );
      }
    } catch (err) {
      this.logger.error(err, '保存离线时的点赞数量出错');
    }
  }
  // 获取离线时的点赞数量
  public async getTheNumberOfLikesWhenOffline(
    targetUserId: number,
  ): Promise<LikeCountEntity> {
    try {
      return this.likeCountRepository.findOne(targetUserId);
    } catch (err) {
      this.logger.error(err, '获取离线时的点赞数量出错');
    }
  }
  // 删除离线时的点赞数量
  public async removeTheNumberOfLikesWhenOffline(
    targetUserId: number,
  ): Promise<void> {
    try {
      await this.likeCountRepository.delete({ targetUserId });
    } catch (err) {
      this.logger.error(err, '删除离线时的点赞数量出错');
    }
  }
}
