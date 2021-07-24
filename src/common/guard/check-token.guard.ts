import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RedisServiceN } from '@src/lib/redis/redis.service';
import { UsersEntity } from '@src/entitys/users.entity';
import { TOKEN_REDIS_KEY_METHOD } from '../constant/auth.constant';
import { NewHttpException } from '../exception/customize.exception';
import { IFastifyRequest } from '@src/app';

// 必须在jwt策略执行完毕后使用此守卫
@Injectable()
export class CheckTokenGuard implements CanActivate {
  constructor(private readonly redisService: RedisServiceN) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: IFastifyRequest = context.switchToHttp().getRequest();
    const token: string = request.headers.authorization.replace('Bearer ', '');
    const user: UsersEntity = request.user;
    const whetherTheTokenIsInvalid: string = await this.redisService.get(
      TOKEN_REDIS_KEY_METHOD(user.email),
    );

    if (whetherTheTokenIsInvalid !== token) {
      throw new NewHttpException('无效授权', 401);
    }
    return true;
  }
}
