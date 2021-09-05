import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Server } from 'ws';
import { UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@src/module/chat/guard/auth.guard';
import { IChatMsg, IWs } from '@src/module/chat/ws.interface';
import { CheckUserAuthGuard } from '@src/module/chat/guard/check-user-auth.guard';
import { WebsocketException } from '@src/common/exception/websocket.exception';
import { ChatEntity } from '@src/entitys/chat.entity';
import { AttentionCountEntity } from '@src/entitys/attention-count.entity';
import { LikeCountEntity } from '@src/entitys/like-count.entity';

@WebSocketGateway()
@UseFilters(WebsocketException)
export class ChatGateway {
  @WebSocketServer()
  public readonly server: Server;

  constructor(private readonly chatService: ChatService) {}

  // 权限认证
  @UseGuards(AuthGuard)
  @SubscribeMessage('auth')
  public async auth(
    // @MessageBody() { token }: AuthDto,
    @ConnectedSocket() client: IWs,
  ): Promise<void> {
    client.send(
      JSON.stringify({
        event: 'auth',
        data: { msg: 'ok', userId: client.user.id },
      }),
    );

    // 查找离线消息
    const offlineMsg: ChatEntity[] = await this.chatService.getOfflineMsg(
      client.user.id,
    );
    client.send(JSON.stringify({ event: 'offlineMsg', data: offlineMsg }));
    // 查找离线时发送的关注请求
    const offlineFollowCount: AttentionCountEntity | undefined =
      await this.chatService.findFollowingRequestsWhileOffline(client.user.id);

    if (typeof offlineFollowCount !== 'undefined') {
      client.send(
        JSON.stringify({
          event: 'offlineFollowCount',
          data: offlineFollowCount.count,
        }),
      );
    }
    // 查找离线时的点赞数量
    const offlineLikeCount: LikeCountEntity | undefined =
      await this.chatService.getTheNumberOfLikesWhenOffline(client.user.id);

    if (typeof offlineLikeCount !== 'undefined') {
      client.send(
        JSON.stringify({
          event: 'offlineLikeCount',
          data: offlineLikeCount.count,
        }),
      );
    }
    // 删除当前用户的离线消息
    await this.chatService.removeOfflineMsg(client.user.id);
    // 删除离线时的关注请求
    await this.chatService.RemoveFollowingRequestsWhileOffline(client.user.id);
    // 删除离线时的点赞数量
    await this.chatService.removeTheNumberOfLikesWhenOffline(client.user.id);
  }

  @UseGuards(CheckUserAuthGuard)
  @SubscribeMessage('chatMessage')
  public async chatMessage(
    @MessageBody() { content, targetUserId, time, type, avatar }: CreateChatDto,
    @ConnectedSocket() currentClient: IWs,
  ): Promise<void> {
    // 验证目标用户是否存在 不存在抛出异常 和
    await this.chatService.checkUserIsExists(targetUserId);
    // 验证是否是相互关注的
    await this.chatService.checkWhetherToPayAttentionToEachOther(
      targetUserId,
      currentClient.user.id,
      time,
      content,
      currentClient,
    );

    const data: IChatMsg = {
      content,
      time,
      type,
      avatar,
      user: currentClient.user,
    };

    // 用户是否在线 如果不在线就把聊天消息存储到数据库中
    const isOnline: boolean = this.send(targetUserId, {
      event: 'chatMessage',
      data,
    });

    if (!isOnline) {
      data.targetUserId = targetUserId;
      //  把本次聊天数据存储入数据库并存入未读
      await this.chatService.saveOfflineMessage(data);
    }
  }

  @UseGuards(CheckUserAuthGuard)
  @SubscribeMessage('heartbeat')
  public heartbeat(@ConnectedSocket() socket: IWs): void {
    socket.send(
      JSON.stringify({
        event: 'heartbeat',
        data: { msg: 'ok' },
      }),
    );
  }

  //  给指定用户发送关注通知 有人关注此人通知此人有人关注了他
  public async sendFollowMsg(targetUserId: number) {
    const isOnline: boolean = this.send(targetUserId, {
      event: 'offlineFollowCount',
      data: 1,
    });
    // 离线消息存入数据库
    if (!isOnline) {
      await this.chatService.saveFollowingRequestsWhileOffline(targetUserId);
    }
  }

  //  给指定用户发送点赞通知 有人点赞该用户的文章或动态时给客户端推送一个数量
  public async sendLikeCount(targetUserId: number) {
    const isOnline: boolean = this.send(targetUserId, {
      event: 'offlineLikeCount',
      data: 1,
    });
    // 离线消息存入数据库
    if (!isOnline) {
      await this.chatService.saveTheNumberOfLikesWhenOffline(targetUserId);
    }
  }

  // 返回是否在线
  public send(
    targetUserId: number,
    data: { event: string; data: any },
  ): boolean {
    let isOnline = false;
    try {
      this.server.clients.forEach((client: IWs) => {
        if (client.user.id === targetUserId) {
          isOnline = true;
          client.send(JSON.stringify(data));
          throw new Error('');
        }
      });
    } catch (err) {}
    return isOnline;
  }
}
