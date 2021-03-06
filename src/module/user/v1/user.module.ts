import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { UserinfoEntity } from '@src/entitys/userinfo.entity';
import { BlackListEntity } from '@src/entitys/black-list.entity';
import { VisitorEntity } from '@src/entitys/visitor.entity';
import { ArticleEntity } from '@src/entitys/article.entity';
import { CheckLoginWeakenedMiddleware } from '@src/common/middleware/check-login-weakened.middleware';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ChatGateway } from '@src/module/chat/chat.gateway';
import { ChatModule } from '@src/module/chat/chat.module';
import { UserExperienceEntity } from '@src/entitys/user.experience.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      UserinfoEntity,
      BlackListEntity,
      VisitorEntity,
      ArticleEntity,
      UserExperienceEntity,
    ]),
    RedisModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    ChatModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CheckLoginWeakenedMiddleware).forRoutes(UserController);
  }
}
