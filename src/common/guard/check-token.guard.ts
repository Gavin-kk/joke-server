import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisServiceN } from '../../lib/redis/redis.service';
import { Request } from 'express';
import { Users } from '../../entitys/Users';
import { tokenRedisKey } from '../constant/auth.constant';
import { NewHttpException } from '../exception/customize.exception';

// 必须在jwt策略执行完毕后使用此守卫
@Injectable()
export class CheckTokenGuard implements CanActivate {
  constructor(private readonly redisService: RedisServiceN) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    const user: Users = request.user as Users;
    const whetherTheTokenIsInvalid = await this.redisService.get(
      tokenRedisKey(user.email),
    );

    if (whetherTheTokenIsInvalid !== token) {
      throw new NewHttpException('无效授权', 401);
    }
    return true;
  }
}
