import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import WebSocket, { Server } from 'ws';
import { Injectable, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { AuthDto } from '@src/module/chat/dto/auth.dto';
import { AuthGuard } from '@src/module/chat/auth.guard';
import { IChatMsg, IWs, IWsResponse } from '@src/module/chat/ws.interface';
import { CheckUserAuthGuard } from '@src/module/chat/check-user-auth.guard';
import { WebsocketException } from '@src/common/exception/websocket.exception';
import { ChatEntity } from '@src/entitys/chat.entity';

@WebSocketGateway(5001)
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
  ) {
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
    // 删除当前用户的离线消息
    await this.chatService.removeOfflineMsg(client.user.id);
  }

  @UseGuards(CheckUserAuthGuard)
  @SubscribeMessage('chatMessage')
  public async chatMessage(
    @MessageBody() { content, targetUserId, time, type, avatar }: CreateChatDto,
    @ConnectedSocket() currentClient: IWs,
  ): Promise<void> {
    this.server.clients.forEach((item: IWs) => {
      console.log(item.user);
    });
    // 验证目标用户是否存在 不存在抛出异常
    await this.chatService.checkUserIsExists(targetUserId);
    // 用户是否在线 如果不在线就把聊天消息存储到数据库中
    let isOnline = false;
    try {
      this.server.clients.forEach((client: IWs) => {
        if (client.user.id === targetUserId) {
          isOnline = true;
          client.send(
            JSON.stringify({
              event: 'chatMessage',
              data: {
                content,
                time,
                type,
                avatar,
                user: currentClient.user,
              },
            }),
          );
          throw new Error('');
        }
      });
    } catch (err) {}

    if (!isOnline) {
      const msgData: IChatMsg = {
        targetUserId,
        content,
        time,
        type,
        avatar,
        user: currentClient.user,
      };
      //  把本次聊天数据存储入数据库并存入未读
      await this.chatService.saveOfflineMessage(msgData);
    }
  }

  @UseGuards(CheckUserAuthGuard)
  @SubscribeMessage('heartbeat')
  public heartbeat(@ConnectedSocket() socket: IWs) {
    socket.send(
      JSON.stringify({
        event: 'heartbeat',
        data: { msg: 'ok' },
      }),
    );
  }
}
