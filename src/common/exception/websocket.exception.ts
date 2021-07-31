import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { IWs } from '@src/module/chat/ws.interface';

@Catch()
export class WebsocketException extends BaseWsExceptionFilter {
  public catch(exception: WsException, host: ArgumentsHost) {
    super.catch(exception, host);
    const wsClient: IWs = host.switchToWs().getClient();
    wsClient.send(JSON.stringify({ event: 'error', data: { msg: exception.message } }));
    console.log(1);
  }
}
