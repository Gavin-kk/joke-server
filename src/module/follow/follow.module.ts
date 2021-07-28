import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from '@src/entitys/follow.entity';
import { UsersEntity } from '@src/entitys/users.entity';
import { RedisModule } from '@src/lib/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([FollowEntity, UsersEntity]), RedisModule],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}
