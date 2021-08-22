import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IWs } from '@src/module/chat/ws.interface';

@Injectable()
export class CheckUserAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: IWs = context.switchToWs().getClient();
    if (!client.user) {
      client.send(
        JSON.stringify({ event: 'error', data: { msg: '无效授权' } }),
      );
      client.close();
      return false;
    }
    return true;
  }
}
