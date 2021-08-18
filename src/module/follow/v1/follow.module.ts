import { forwardRef, Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from '@src/entitys/follow.entity';
import { UsersEntity } from '@src/entitys/users.entity';
import { RedisModule } from '@src/lib/redis/redis.module';
import { ChatModule } from '@src/module/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowEntity, UsersEntity]),
    forwardRef(() => ChatModule),
    RedisModule,
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
