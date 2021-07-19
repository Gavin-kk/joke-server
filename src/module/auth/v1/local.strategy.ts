import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../entitys/Users';
import { Repository } from 'typeorm';
import { isEmail, isPhoneNumber } from 'class-validator';
import { compareSync } from 'bcryptjs';
import { NewHttpException } from '../../../common/exception/customize.exception';

export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @InjectRepository(Users)
    private users: Repository<Users>,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    } as IStrategyOptions);
  }
  private async validate(username: string, password: string) {
    let user: Users;
    if (isEmail(username)) {
      //  邮箱登录
      user = await this.users.findOne({ email: username });
    } else if (isPhoneNumber(username, 'CN')) {
      //  手机号登录
      user = await this.users.findOne({ phone: username });
    } else {
      //  昵称登录
      user = await this.users.findOne({ nickname: username });
    }
    if (user) {
      if (!user) throw new NewHttpException('账号或密码错误', 400);

      if (user && compareSync(password, user.password)) return user;
    } else {
      throw new NewHttpException('用户不存在', 404);
    }
  }
}
