import { Injectable, Logger } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import {
  Connection,
  QueryRunner,
  Repository,
  createQueryBuilder,
} from 'typeorm';
import { FollowEntity } from '@src/entitys/follow.entity';
import { NewHttpException } from '@src/common/exception/customize.exception';

@Injectable()
export class FollowService {
  private logger: Logger = new Logger('FollowService');

  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    private readonly connection: Connection,
  ) {}

  public async followUsers(followId: number, userId: number) {
    if (followId === userId) throw new NewHttpException('不能关注自己');
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      // 查询是否已被关注
      const isFollowUsers: FollowEntity | undefined =
        await queryRunner.manager.findOne(FollowEntity, { userId, followId });
      if (typeof isFollowUsers === 'undefined') {
        await queryRunner.manager.save(FollowEntity, { userId, followId });
        await queryRunner.commitTransaction();
        return '关注成功';
      } else {
        await queryRunner.manager.delete(FollowEntity, { userId, followId });
        await queryRunner.commitTransaction();
        return '取关成功';
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err, '关注或取关失败');
      throw new NewHttpException('关注或取关失败');
    } finally {
      await queryRunner.release();
    }
  }

  public async getMutualList(userId: number): Promise<UsersEntity[]> {
    const sql =
      'SELECT users.id,users.username,users.avatar,users.email,users.phone,users.nickname,users.createAt,users.updateAt FROM `users` `u` INNER JOIN `follow` `c`ON `c`.`user_id`=`u`.`id` LEFT JOIN `users` ON `users`.`id`=`c`.`follow_id` INNER JOIN `follow` `fans` ON `fans`.`follow_id`=`u`.`id` WHERE `u`.`id` = ? AND `c`.`follow_id` = `fans`.`user_id`';
    return this.followRepository.query(sql, [userId]);
    /*    return this.usersRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.follows', 'iFollow')
      .leftJoinAndSelect('iFollow.follow', 'follow')
      .innerJoin('u.followed', 'fans')
      .select('u.id')
      .addSelect(['iFollow.userId', 'iFollow.id'])
      .addSelect('follow')
      .where('u.id = :userId', { userId })
      .andWhere('iFollow.follow_id = fans.user_id')
      .getOne();*/
  }
  // 获取粉丝列表
  public async getFanList(userId: number) {
    // 关注我的用户
    const userList: UsersEntity[] = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.followed', 'followed')
      .leftJoinAndSelect('followed.user', 'users')
      .select(
        'users.id,users.username,users.avatar,users.email,users.phone,users.nickname,users.createAt,users.updateAt',
      )
      .orderBy('followed.id', 'DESC')
      .where('user.id = :userId', { userId })
      .getRawMany();

    if (userList[0].id === null) {
      return [];
    }
    // 查询所有互关列表
    const mutualList = await this.getMutualList(userId);
    return userList.map((item) => {
      const mutualRelations = mutualList.find((itex) => itex.id === item.id);
      if (typeof mutualRelations !== 'undefined') {
        return {
          ...item,
          followEachOther: true,
        };
      } else {
        return {
          ...item,
          followEachOther: false,
        };
      }
    });
  }

  public async getFollowMeUserList(userId: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.follows', 'followed')
      .leftJoinAndSelect('followed.follow', 'users')
      .select(
        'users.id,users.username,users.avatar,users.email,users.phone,users.nickname,users.createAt,users.updateAt',
      )
      .where('user.id = :userId', { userId })
      .getRawMany();
  }

  public async mutualWhether(
    userId: number,
    targetUserId: number,
  ): Promise<boolean> {
    // 查看当前用户互关列表
    const mutualConcernList: UsersEntity[] = await this.getMutualList(userId);
    const findIndex: number = mutualConcernList.findIndex(
      (item) => item.id === targetUserId,
    );
    return findIndex !== -1;
  }
}
