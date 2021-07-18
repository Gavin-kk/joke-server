import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { Users } from '../../entitys/Users';
import { PasswordLogin } from './dto/passwrod-login.dto';
import { authExpiredConfig } from '../../../config/auth-expired.config';

@ApiTags('授权模块')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // 账号密码登录
  @ApiOperation({
    summary: '账号密码登录 (手机号, 昵称, 邮箱)',
  })
  @ApiBody({
    description: '用户名和密码',
    type: PasswordLogin,
  })
  @Post('password/login')
  @UseGuards(AuthGuard('local'))
  passwordLogin(@CurrentUser() user: Users) {
    const { password, id } = user;
    const token = this.jwtService.sign(
      { id, password },
      { expiresIn: authExpiredConfig },
    );
    return {
      user,
      token,
    };
  }

  @ApiOperation({
    summary: '邮箱验证码登录',
    description: '必须先通过api/v1/email/code获取验证码',
  })
  @Post('email/login')
  async emailLogin(@Body() emailLoginDto: EmailLoginDto) {
    const user: Users = await this.authService.verifyLogin(emailLoginDto);
    const { password, id } = user;
    const token: string = this.jwtService.sign(
      { id, password },
      { expiresIn: authExpiredConfig },
    );
    delete user.password;
    return {
      user,
      token,
    };
  }
}
