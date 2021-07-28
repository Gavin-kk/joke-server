import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IFastifyRequest } from '@src/app';
import { NewHttpException } from '@src/common/exception/customize.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles: string[] = this.reflector.get<string[]>('roles', context.getHandler());
    const request: IFastifyRequest = context.switchToHttp().getRequest();
    const authorize: boolean = request.user.roles.some((item) => roles.includes(item.role));
    if (!authorize) {
      throw new NewHttpException('禁止访问', 403);
    }
    return true;
  }
}
