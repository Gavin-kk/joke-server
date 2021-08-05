import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IFastifyRequest } from '@src/app';
import { ServerResponse } from 'http';

interface IRequest extends IFastifyRequest {
  userId: number | null;
}
// 此方法是check-login守卫的弱化版 此方法仅用于获取用户id 或 判断用户是否登录 就算不登陆也不会有阻止用户
@Injectable()
export class CheckLoginWeakenedMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: IRequest, res: ServerResponse, next: () => void) {
    const authorization: string = req.headers.authorization;
    if (authorization) {
      const token: string = authorization.replace('Bearer ', '');
      try {
        const { id }: { password: string; id: number } = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        if (id) {
          req.userId = id;
        }
      } catch (err) {}
    } else {
      req.userId = null;
    }
    next();
  }
}
