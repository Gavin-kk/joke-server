import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService, IAuthServiceOtherLoginError } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Users } from '../../entitys/Users';
import { PasswordLogin } from './dto/passwrod-login.dto';
import { OtherLoginDto } from './dto/other-login.dto';

@ApiTags('授权模块')
@Controller('api/v1/auth/login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 账号密码登录
  @ApiOperation({
    summary: '账号密码登录 (手机号, 昵称, 邮箱)',
  })
  @ApiBody({
    description: '用户名和密码',
    type: PasswordLogin,
  })
  @Post('password')
  @UseGuards(AuthGuard('local'))
  public async passwordLogin(@CurrentUser() user: Users) {
    // 验证用户是否黑名单
    await this.authService.checkIfTheUserIsBlacklisted(user);
    const token = this.authService.generateToken(user.id, user.password);
    return {
      user,
      token,
    };
  }

  @ApiOperation({
    summary: '邮箱验证码登录',
    description: '必须先通过api/v1/email/code获取验证码',
  })
  @Post('email')
  public async emailLogin(@Body() emailLoginDto: EmailLoginDto) {
    const user: Users = await this.authService.verifyLogin(emailLoginDto);
    // 验证用户是否黑名单
    await this.authService.checkIfTheUserIsBlacklisted(user);

    const token: string = this.authService.generateToken(
      user.id,
      user.password,
    );
    delete user.password;
    return {
      user,
      token,
    };
  }

  @ApiOperation({
    summary: '第三方登录 (qq,微信,微博)',
    description:
      '如果是第一次第三方登陆请在申请完本接口后 绑定邮箱页面直接申请邮箱登录接口 如果是第二次第三方登录申请本接口即可',
  })
  @Post('other')
  public async otherLogin(@Body() otherLoginDto: OtherLoginDto) {
    const result: IAuthServiceOtherLoginError | Users =
      await this.authService.otherLogin(otherLoginDto);

    if ((result as IAuthServiceOtherLoginError).text) {
      return result;
    }
    // 验证用户是否黑名单
    await this.authService.checkIfTheUserIsBlacklisted(result as Users);

    const token: string = this.authService.generateToken(
      (result as Users).id,
      (result as Users).password,
    );
    return {
      user: result,
      token,
    };
  }

  // @Get('test')
  // @ApiBearerAuth()
  // @UseGuards(CheckUserIsBlacklisted)
  // @UseGuards(AuthGuard('jwt'))
  // @ApiOperation({ summary: '测试jwt' })
  // async testjwt(@CurrentUser() user) {
  //   return user;
  // }
}
