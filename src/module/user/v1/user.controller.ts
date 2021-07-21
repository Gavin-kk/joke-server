import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import * as crypto from 'crypto';
import { IFastifyRequest } from '@src/app';
import { FastifyReply } from 'fastify';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('userinfo')
  async getUserInfo(@Res() res: FastifyReply) {
    res.send('hello,word');
  }
}
