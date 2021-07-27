import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IFastifyRequest } from '@src/app';

export const CurrentUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const req: IFastifyRequest = ctx.switchToHttp().getRequest();
  return data ? req.user[data] : req.user;
});
