import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { UserinfoEntity } from '@src/entitys/userinfo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, UserinfoEntity]), RedisModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
