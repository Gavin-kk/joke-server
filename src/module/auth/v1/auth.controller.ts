import { Controller, Post, Body, UseGuards, Get, Logger } from '@nestjs/common';
import { AuthService, IAuthServiceOtherLoginError } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from '@src/entitys/users.entity';
import { PasswordLogin } from './dto/passwrod-login.dto';
import { OtherLoginDto } from './dto/other-login.dto';
import { RedisServiceN } from 'src/lib/redis/redis.service';
import {
  TOKEN_EXPIRED,
  TOKEN_REDIS_KEY_METHOD,
} from 'src/common/constant/auth.constant';
import { NewHttpException } from 'src/common/exception/customize.exception';
import { Auth } from '@src/common/decorator/auth.decorator';
import { OtherBindEmailDto } from './dto/other-bind-email.dto';

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
    description: `如果是第一次第三方登陆请在申请完本接口后 
      由前端保存本接口返回的用户绑定表里的id 跳转到绑定邮箱页面 
      然后请求api/v1/auth/login/other/bind/email 携带本接口响应的用户绑定表里的id 
      如果是第二次第三方登录申请本接口即可`,
  })
  @Post('other')
  public async otherLogin(
    @Body() otherLoginDto: OtherLoginDto,
  ): Promise<
    IAuthServiceOtherLoginError | { user: UsersEntity; token: string }
  > {
    // 第三方账号需要绑定邮箱 一个邮箱可以绑定多个 第三方账号 但多第三方账号只能绑定一个邮箱
    const result: IAuthServiceOtherLoginError | UsersEntity =
      await this.authService.otherLogin(otherLoginDto);

    if ((result as IAuthServiceOtherLoginError).text) {
      return result as IAuthServiceOtherLoginError;
    }

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

  @ApiOperation({
    summary: '初始化第三方登录 ',
    description:
      '第三方账号第一次登录时绑定邮箱 请求本接口需要先请求邮箱验证码 type 为 login',
  })
  @Post('other/bind/email')
  public async bindEmail(
    @Body() bindEmailDto: OtherBindEmailDto,
  ): Promise<{ user: UsersEntity; token: string }> {
    const user: UsersEntity = await this.authService.otherLoginBindEmail(
      bindEmailDto,
    );
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
      this.logger.log(err, '第三方账号绑定邮箱token写入缓存失败');
      throw new NewHttpException('登录失败,请重试');
    }
    return {
      user,
      token,
    };
  }

  @ApiOperation({ summary: '退出登录' })
  @ApiBearerAuth()
  @Post('exit')
  @Auth()
  async exit(@CurrentUser() user: UsersEntity): Promise<void> {
    try {
      await this.redisService.del(TOKEN_REDIS_KEY_METHOD(user.email));
    } catch (err) {
      this.logger.error(err, 'redis删除token出错');
      throw new NewHttpException('退出失败', 400);
    }
  }
}
