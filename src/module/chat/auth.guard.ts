import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { IWs } from '@src/module/chat/ws.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = context.switchToWs().getData().token;
    const client: IWs = context.switchToWs().getClient();
    if (typeof token === 'string') {
      try {
        const { id: userId }: { id: number } = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        client.user = await this.usersRepository.findOne(userId);
      } catch (err) {
        throw new WsException('权限错误');
      }
    } else {
      client.send(JSON.stringify({ event: 'error', msg: '权限不足' }));
    }
    return true;
  }
}
