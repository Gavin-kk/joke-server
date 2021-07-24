import { Controller, Post, Body, UseGuards, Get, Logger } from '@nestjs/common';
import { AuthService, IAuthServiceOtherLoginError } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from '@src/entitys/users.entity';
import { PasswordLogin } from './dto/passwrod-login.dto';
import { OtherLoginDto } from './dto/other-login.dto';
import { CheckTokenGuard } from 'src/common/guard/check-token.guard';
import { RedisServiceN } from 'src/lib/redis/redis.service';
import {
  TOKEN_EXPIRED,
  TOKEN_REDIS_KEY_METHOD,
} from 'src/common/constant/auth.constant';
import { NewHttpException } from 'src/common/exception/customize.exception';
import { Auth } from '@src/common/decorator/auth.decorator';

@ApiTags('授权模块')
@Controller('api/v1/auth/login')
export class AuthController {
  private logger: Logger = new Logger('AuthController');

  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisServiceN,
  ) {}

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
  public async passwordLogin(
    @CurrentUser() user: UsersEntity,
  ): Promise<{ user: UsersEntity; token: string }> {
    // 验证用户是否黑名单
    await this.authService.checkIfTheUserIsBlacklisted(user);
    // 生成token
    const token: string = this.authService.generateToken(
      user.id,
      user.password,
    );
    try {
      // 把 token 写入缓存
      await this.redisService.set(
        TOKEN_REDIS_KEY_METHOD(user.email),
        token,
        TOKEN_EXPIRED,
      );
    } catch (err) {
      this.logger.log(err, '账号密码登录token写入缓存失败');
      throw new NewHttpException('登录失败', 400);
    }
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
  public async emailLogin(
    @Body() emailLoginDto: EmailLoginDto,
  ): Promise<{ user: UsersEntity; token: string }> {
    const user: UsersEntity = await this.authService.verifyLogin(emailLoginDto);
    // 验证用户是否黑名单
    await this.authService.checkIfTheUserIsBlacklisted(user);

    const token: string = this.authService.generateToken(
      user.id,
      user.password,
    );

    try {
      // 把 token 写入缓存
      await this.redisService.set(
        TOKEN_REDIS_KEY_METHOD(user.email),
        token,
        TOKEN_EXPIRED,
      );
    } catch (err) {
      this.logger.log(err, 'email登录token写入缓存失败');
      throw new NewHttpException('登录失败', 400);
    }
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
  public async otherLogin(
    @Body() otherLoginDto: OtherLoginDto,
  ): Promise<
    IAuthServiceOtherLoginError | { user: UsersEntity; token: string }
  > {
    const result: IAuthServiceOtherLoginError | UsersEntity =
      await this.authService.otherLogin(otherLoginDto);

    if ((result as IAuthServiceOtherLoginError).text) {
      return result as IAuthServiceOtherLoginError;
    }
    // 验证用户是否黑名单
    await this.authService.checkIfTheUserIsBlacklisted(result as UsersEntity);

    const token: string = this.authService.generateToken(
      (result as UsersEntity).id,
      (result as UsersEntity).password,
    );

    try {
      // 把 token 写入缓存
      await this.redisService.set(
        TOKEN_REDIS_KEY_METHOD((result as UsersEntity).email),
        token,
        TOKEN_EXPIRED,
      );
    } catch (err) {
      this.logger.log(err, '第三方登录token写入缓存失败');
      throw new NewHttpException('登录失败', 400);
    }

    return {
      user: result as UsersEntity,
      token,
    };
  }

  @Get('test')
  @ApiOperation({ summary: '测试jwt' })
  async testjwt(@CurrentUser() user) {
    this.logger.error('redis删除token出错');
    return user;
  }

  @ApiOperation({ summary: '退出登录' })
  @ApiBearerAuth()
  @Post('exit')
  @Auth()
  async exit(@CurrentUser() user: UsersEntity): Promise<string> {
    try {
      await this.redisService.del(TOKEN_REDIS_KEY_METHOD(user.email));
    } catch (err) {
      this.logger.error(err, 'redis删除token出错');
      throw new NewHttpException('退出失败', 400);
    }
    return 'ok';
  }
}
