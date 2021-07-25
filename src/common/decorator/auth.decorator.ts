import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CheckLoginGuard } from '@src/common/guard/check-login.guard';

export const Auth = () =>
  applyDecorators(UseGuards(AuthGuard('jwt'), CheckLoginGuard));
