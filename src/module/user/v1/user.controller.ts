import { Controller, Get, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyReply } from 'fastify';
import { ApiOperation } from '@nestjs/swagger';
import { UsersEntity } from '@src/entitys/users.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '搜索用户' })
  @Get('search')
  public async getUserInfo(
    @Query('content') content: string,
  ): Promise<UsersEntity> {
    return this.userService.searchUser(content);
  }
}
