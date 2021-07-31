import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { UserinfoEntity } from '@src/entitys/userinfo.entity';
import { BlackListEntity } from '@src/entitys/black-list.entity';
import { VisitorEntity } from '@src/entitys/visitor.entity';
import { ArticleEntity } from '@src/entitys/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      UserinfoEntity,
      BlackListEntity,
      VisitorEntity,
      ArticleEntity,
    ]),
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
