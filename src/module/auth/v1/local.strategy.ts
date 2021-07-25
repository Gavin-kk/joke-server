import { PassportStrategy } from '@nestjs/passport';
import { IStrategyOptions, Strategy } from 'passport-local';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';
import { isEmail, isPhoneNumber } from 'class-validator';
import { compareSync } from 'bcryptjs';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    } as IStrategyOptions);
  }

  public async validate(username: string, password: string) {
    let user: UsersEntity;
    if (isEmail(username)) {
      //  邮箱登录
      user = await this.usersRepository.findOne({ email: username });
    } else if (isPhoneNumber(username, 'CN')) {
      //  手机号登录
      user = await this.usersRepository.findOne({ phone: username });
    } else {
      //  昵称登录
      user = await this.usersRepository.findOne({ nickname: username });
    }

    if (user) {
      if (compareSync(password, user.password)) {
        if (user.status !== 0) {
          throw new NewHttpException('用户已被列入黑名单');
        }
        return user;
      }
    } else {
      throw new NewHttpException('账号或密码错误', 400);
    }
  }
}
