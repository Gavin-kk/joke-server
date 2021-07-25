import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IFastifyRequest } from '@src/app';
// 此装饰器需要配合 CheckLoginWeakenedMiddleware 中间件使用
export const CurrentUserId = createParamDecorator(
  (data: string, ctx: ExecutionContext): number | undefined => {
    const request: IFastifyRequest = ctx.switchToHttp().getRequest();
    return request.raw.userId;
  },
);
