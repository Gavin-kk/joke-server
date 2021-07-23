import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CheckTokenGuard } from '@src/common/guard/check-token.guard';

export const Auth = () =>
  applyDecorators(UseGuards(AuthGuard('jwt'), CheckTokenGuard));
