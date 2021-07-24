import { Body, Controller, Get, Post, Put, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { FastifyReply } from 'fastify';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersEntity } from '@src/entitys/users.entity';
import { Auth } from '@src/common/decorator/auth.decorator';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EditEmailDto } from '@src/module/user/v1/dto/edit-email.dto';

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: '修改密码',
    description: '使用本接口需要先获取验证码',
  })
  @ApiBearerAuth()
  @Put('edit/password')
  @Auth()
  public async updatePassword(
    @Body() editPasswordDto: EditPasswordDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    return this.userService.editPassword(editPasswordDto, user);
  }

  @ApiOperation({
    summary: '修改邮箱',
    description: '使用本接口需要先获取验证码',
  })
  @ApiBearerAuth()
  @Put('edit/email')
  @Auth()
  public async updateEmail(
    @Body() editEmailDto: EditEmailDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    return this.userService.editEmail(editEmailDto, user);
  }

  @ApiOperation({ summary: '搜索用户' })
  @Get('search')
  public async getUserInfo(
    @Query('content') content: string,
  ): Promise<UsersEntity | null> {
    return this.userService.searchUser(content);
  }
}
