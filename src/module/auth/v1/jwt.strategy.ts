import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { UserBindEntity } from '@src/entitys/user-bind.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    } as StrategyOptions);
  }

  private async validate({
    id,
    password,
  }: {
    id: number;
    password: string;
  }): Promise<UsersEntity | UserBindEntity> {
    let user: UsersEntity | UserBindEntity;
    const userExists: UsersEntity = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.id = :id', { id })
      .getOne();
    if (userExists && password === userExists.password) {
      user = userExists;
    } else {
      throw new NewHttpException('无效授权', 401);
    }
    return user;
  }
}
