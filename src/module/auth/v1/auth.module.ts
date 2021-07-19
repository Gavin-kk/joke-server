import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entitys/Users';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../../../lib/redis/redis.module';
import { UserBind } from '../../entitys/UserBind';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([Users, UserBind]),
    JwtModule.registerAsync({
      useFactory: () => ({ secret: process.env.JWT_SECRET }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
