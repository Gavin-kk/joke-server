import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersEntity } from '@src/entitys/users.entity';
import { Auth } from '@src/common/decorator/auth.decorator';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EditEmailDto } from '@src/module/user/v1/dto/edit-email.dto';
import { EditAvatarDto } from '@src/module/user/v1/dto/edit-avatar.dto';
import { EditUserinfoDto } from '@src/module/user/v1/dto/edit-userinfo.dto';
import { BlockUserDto } from '@src/module/user/v1/dto/block-user.dto';
import { AddVisitorDto } from '@src/module/user/v1/dto/add-visitor.dto';
import { CurrentUserId } from '@src/common/decorator/current-userId.decorator';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import * as joi from 'joi';
import { ChatGateway } from '@src/module/chat/chat.gateway';
const schema = joi.number().required();

@ApiTags('用户模块')
@Controller('api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private chatGateway: ChatGateway,
  ) {}

  @ApiOperation({ summary: '获取用户详情 携带访客信息' })
  @ApiBearerAuth()
  @Get('info')
  // @Auth()
  public async getUserDetails(
    @Query('id') targetUserId: number,
    @CurrentUserId() userId: number,
  ): Promise<UsersEntity> {
    return this.userService.getUserDetail(userId, +targetUserId);
  }

  @ApiOperation({ summary: '添加访客' })
  @ApiBearerAuth()
  @Post('visitor')
  @Auth()
  public async addGuest(
    @CurrentUser('id') userId: number,
    @Body() { visitorUserId }: AddVisitorDto,
  ): Promise<void> {
    await this.userService.addVisitor(userId, visitorUserId);
  }

  @ApiOperation({ summary: '拉黑用户或解除拉黑 需要登录 传入被拉黑人的id' })
  @ApiBearerAuth()
  @Post('black')
  @Auth()
  public async blockUsers(
    @Body() blockUserDto: BlockUserDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<string> {
    return this.userService.blockUsers(blockUserDto, user.id);
  }

  @ApiOperation({ summary: '修改个人头像' })
  @ApiBearerAuth()
  @Put('edit/avatar')
  @Auth()
  public async editAvatar(
    @Body() { avatarUrl }: EditAvatarDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<string> {
    return this.userService.editAvatar(avatarUrl, user.id);
  }

  @ApiOperation({ summary: '修改个人资料' })
  @ApiBearerAuth()
  @Put('edit/userinfo')
  @Auth()
  public async editUserInfo(
    @Body() userinfoDto: EditUserinfoDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<string> {
    return this.userService.editUserInfo(userinfoDto, user);
  }

  @ApiOperation({
    summary: '修改密码',
    description: '使用本接口需要先获取验证码 需要token',
  })
  @ApiBearerAuth()
  @Put('edit/password')
  @Auth()
  public async updatePassword(
    @Body() editPasswordDto: EditPasswordDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    await this.userService.editPassword(editPasswordDto, user);
  }

  @ApiOperation({
    summary: '修改邮箱 已登录',
    description: '使用本接口需要先获取验证码 需要token',
  })
  @ApiBearerAuth()
  @Put('edit/email')
  @Auth()
  public async updateEmail(
    @Body() editEmailDto: EditEmailDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<void> {
    await this.userService.editEmail(editEmailDto, user);
  }

  @ApiOperation({ summary: '搜索用户' })
  @Get('search')
  public async getUserInfo(
    @Query('content') content: string,
  ): Promise<UsersEntity[]> {
    return this.userService.searchUser(content);
  }

  @ApiOperation({ summary: '更改用户主页背景' })
  @ApiBearerAuth()
  @Put('changebg')
  @Auth()
  public async changeUserBg(
    @CurrentUser('id') userId: number,
    @Body('imageUrl') imageUrl: string,
  ): Promise<void> {
    return this.userService.changeUserBg(userId, imageUrl);
  }
}
