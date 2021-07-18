import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../entitys/Users';
import { Repository } from 'typeorm';
import { NewHttpException } from '../../../common/exception/customize.exception';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    } as StrategyOptions);
  }

  async validate({
    id,
    password,
  }: {
    id: number;
    password: string;
  }): Promise<Users> {
    const user: Users = await this.users.findOne({ id });
    if (!user || password !== user.password) {
      throw new NewHttpException('无效授权', 401);
    }
    return user;
  }
}
