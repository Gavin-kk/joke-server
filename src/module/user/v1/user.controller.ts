import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UsersEntity } from '@src/entitys/users.entity';
import { Auth } from '@src/common/decorator/auth.decorator';
import { CurrentUser } from '@src/common/decorator/current-user.decorator';
import { EditPasswordDto } from './dto/edit-password.dto';
import { EditEmailDto } from '@src/module/user/v1/dto/edit-email.dto';
import { EditAvatarDto } from '@src/module/user/v1/dto/edit-avatar.dto';
import { EditUserinfoDto } from '@src/module/user/v1/dto/edit-userinfo.dto';

@ApiTags('用户模块')
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    return this.userService.editUserInfo(userinfoDto, user.id);
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
  public async getUserInfo(@Query('content') content: string): Promise<UsersEntity | null> {
    return this.userService.searchUser(content);
  }
}
