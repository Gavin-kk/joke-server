import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../entitys/Users';
import { Repository } from 'typeorm';
import { NewHttpException } from '../../../common/exception/customize.exception';
import { UserBind } from '../../entitys/UserBind';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(UserBind)
    private readonly userBindRepository: Repository<UserBind>,
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
  }): Promise<Users | UserBind> {
    let user: Users | UserBind;
    const userExists: Users | undefined = await this.usersRepository.findOne({
      id,
      password,
    });
    if (userExists && password === userExists.password) {
      user = userExists;
    } else {
      throw new NewHttpException('无效授权', 401);
    }

    return user;
  }
}
