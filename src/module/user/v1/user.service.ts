import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository, Connection, QueryRunner } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { EditPasswordDto } from '@src/module/user/v1/dto/edit-password.dto';
import { RedisServiceN } from '@src/lib/redis/redis.service';
import {
  REDIS_EDIT_EMAIL_KEY_METHOD,
  REDIS_EDIT_PASSWORD_KEY_METHOD,
} from '@src/common/constant/email.constant';
import { TOKEN_REDIS_KEY_METHOD } from '@src/common/constant/auth.constant';
import { EditEmailDto } from '@src/module/user/v1/dto/edit-email.dto';
import { EditUserinfoDto } from '@src/module/user/v1/dto/edit-userinfo.dto';
import { UserinfoEntity } from '@src/entitys/userinfo.entity';
import { BlockUserDto } from '@src/module/user/v1/dto/block-user.dto';
import { BlackListEntity } from '@src/entitys/black-list.entity';
import { VisitorEntity } from '@src/entitys/visitor.entity';
import { ArticleEntity } from '@src/entitys/article.entity';
import { compareSync } from 'bcryptjs';
import { promisify } from 'util';
import { unlink } from 'fs';
import * as path from 'path';
import { UserExperienceEntity } from '@src/entitys/user.experience.entity';
import * as Moment from 'moment';

@Injectable()
export class UserService {
  private logger: Logger = new Logger('UserService');
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(UserinfoEntity)
    private readonly userinfoRepository: Repository<UserinfoEntity>,
    @InjectRepository(BlackListEntity)
    private readonly blackListRepository: Repository<BlackListEntity>,
    @InjectRepository(VisitorEntity)
    private readonly visitorRepository: Repository<VisitorEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserExperienceEntity)
    private readonly userExperienceRepository: Repository<UserExperienceEntity>,
    private readonly redisService: RedisServiceN,
    private readonly connection: Connection,
  ) {}

  // 获取用户详情
  public async getUserDetail(
    userIdT?: number,
    targetUserId?: number,
  ): Promise<UsersEntity> {
    let userId: number | undefined;
    if (!userIdT && !targetUserId) throw new NewHttpException('参数错误');
    if ((targetUserId && userIdT) || (targetUserId && !userIdT)) {
      //  查targetId
      userId = targetUserId;
    }
    if (userIdT && !targetUserId) {
      //  查当前请求的用户
      userId = userIdT;
    }
    try {
      // 我的粉丝
      const fans: { fansCount: string } = await this.usersRepository
        .createQueryBuilder('u')
        .leftJoin('u.followed', 'fans')
        .select('count(fans.follow_id) fansCount')
        .where('u.id = :userId', { userId })
        .getRawOne();
      // 我的关注
      const follow: { followCount: string } = await this.usersRepository
        .createQueryBuilder('u')
        .leftJoin('u.follows', 'followed')
        .select('count(followed.user_id) followCount')
        .where('u.id = :userId', { userId })
        .getRawOne();
      // 给我点赞的数量
      const like: { likeCount: string } = await this.articleRepository
        .createQueryBuilder('art')
        .leftJoin('art.userArticlesLikes', 'ulike', 'ulike.is_like = 1')
        .select('count(ulike.is_like) likeCount')
        .where('ulike.user_id = :userId', { userId })
        .getRawOne();
      const query = this.usersRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.userinfo', 'info')
        // 查询访问我的有多少
        .loadRelationCountAndMap('u.totalVisitors', 'u.interviewee')
        // 查询今日访客
        .loadRelationCountAndMap(
          'u.todaySVisitor',
          'u.interviewee',
          'todaySVisitor',
          (qb) =>
            qb.where('todaySVisitor.time > :today', {
              today: new Date().getTime() - 1000 * 60 * 60 * 24,
            }),
        )
        .leftJoinAndSelect('u.userExperiences', 'userExperiences');
      if (userIdT) {
        query.leftJoinAndSelect(
          'u.followed',
          'follows',
          'follows.user_id = :userIdT',
          { userIdT },
        );
      }
      const user: UsersEntity = await query
        .where('u.id = :userId', { userId })
        .getOne();

      user.likeCount = +like.likeCount;
      user.followCount = +follow.followCount;
      user.fansCount = +fans.fansCount;
      if (
        typeof userIdT !== 'undefined' &&
        typeof targetUserId !== 'undefined' &&
        +userIdT === +targetUserId
      ) {
        // 判断当前请求的用户是不是自己
        user.isMe = true;
      }
      return user;
    } catch (err) {
      this.logger.error(err, '获取用户信息失败');
      throw new NewHttpException('没有此用户');
    }
  }

  // 拉黑用户
  public async blockUsers(
    { blackUserId }: BlockUserDto,
    currentUserId: number,
  ): Promise<string> {
    if (blackUserId === currentUserId)
      throw new NewHttpException('不能拉黑自己');
    const queryRunner: QueryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      // 查看用户是否已被拉黑 如果已被拉黑则解除拉黑 如果未被拉黑则拉黑
      const isBlack: BlackListEntity | undefined =
        await queryRunner.manager.findOne(BlackListEntity, {
          userId: currentUserId,
          blackUserId,
        });
      if (typeof isBlack === 'undefined') {
        await queryRunner.manager.save(BlackListEntity, {
          userId: currentUserId,
          blackUserId,
        });
        await queryRunner.commitTransaction();
        return '拉黑成功';
      } else {
        await queryRunner.manager.delete(BlackListEntity, {
          userId: currentUserId,
          blackUserId,
        });
        await queryRunner.commitTransaction();
        return '解除拉黑成功';
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err, '拉黑或解除拉黑失败');
      throw new NewHttpException('拉黑或解除拉黑失败');
    } finally {
      await queryRunner.release();
    }
  }

  public async searchUser(content: string): Promise<UsersEntity[]> {
    if (!content) throw new NewHttpException('参数错误');
    return this.usersRepository
      .createQueryBuilder('u')
      .where(
        "CONCAT(IFNULL(`username`,''),IFNULL(`email`,''),IFNULL(`nickname`,'')) like :content",
        {
          content: `%${content}%`,
        },
      )
      .getMany();
  }

  public async editPassword(
    { VCode, newPassword }: EditPasswordDto,
    user: UsersEntity,
  ): Promise<void> {
    // 检查验证码
    const VCodeIsExists: number | null = await this.redisService.get(
      REDIS_EDIT_PASSWORD_KEY_METHOD(user.email),
    );
    if (VCodeIsExists === null || VCode !== VCodeIsExists)
      throw new NewHttpException('验证码错误');

    try {
      // 更新密码
      await this.usersRepository
        .createQueryBuilder()
        .update()
        .set({ password: newPassword })
        .where('id = :id', { id: user.id })
        .execute();
      // 让token失效
      await this.redisService.del(TOKEN_REDIS_KEY_METHOD(user.email));
    } catch (err) {
      this.logger.error(err, '更新密码出错');
      throw new NewHttpException('更新出现错误');
    }
  }

  // 修改邮箱
  public async editEmail(
    { VCode, newEmail, password }: EditEmailDto,
    user: UsersEntity,
  ): Promise<void> {
    // 查询用户密码是否正确
    if (!compareSync(password, user.password)) {
      throw new NewHttpException('密码错误');
    }
    // 检查验证码
    const VCodeIsExists: number | null = await this.redisService.get(
      REDIS_EDIT_EMAIL_KEY_METHOD(newEmail),
    );
    if (VCodeIsExists === null || VCode !== VCodeIsExists)
      throw new NewHttpException('验证码错误');

    // 更新邮箱
    try {
      await this.usersRepository
        .createQueryBuilder()
        .update()
        .set({ email: newEmail })
        .where('id = :id', { id: user.id })
        .execute();
      // 让token失效
      await this.redisService.del(TOKEN_REDIS_KEY_METHOD(user.email));
    } catch (err) {
      this.logger.error(err, '更新邮箱出错');
      throw new NewHttpException('更新失败 该邮箱可能已被绑定');
    }
  }

  public async editAvatar(avatarUrl: string, userId: number): Promise<string> {
    try {
      await this.usersRepository.update(
        { id: userId },
        {
          avatar: avatarUrl,
        },
      );
      return '修改成功';
    } catch (err) {
      this.logger.error(err, '未知原因出错');
      throw new NewHttpException('更新失败', 400);
    }
  }
  // 修改用户信息
  public async editUserInfo(
    {
      nickname,
      gender,
      hometown,
      birthday,
      job,
      emotion,
      age,
      avatar,
    }: EditUserinfoDto,
    user: UsersEntity,
  ): Promise<string> {
    try {
      // 修改用户昵称
      if (nickname || avatar) {
        await this.usersRepository.update(
          { id: user.id },
          {
            nickname: nickname || null,
            avatar: avatar || user.avatar,
          },
        );
        // 如果用户要更改头像那么把以前的头像从服务器上删除掉
        if (avatar && user.avatar !== avatar) {
          const unFile = promisify(unlink);
          const fileName: string = user.avatar.replace(
            `https://${process.env.APP_HOST}:${process.env.APP_PORT}/static/image/`,
            '',
          );
          await unFile(
            path.join(__dirname, '../../../', 'upload-file/image', fileName),
          );
        }
      }

      //  修改详情 userinfo表
      await this.userinfoRepository.update(
        { userId: user.id },
        {
          gender,
          hometown,
          birthday,
          job,
          emotion,
          age,
        },
      );
      return '更新成功';
    } catch (err) {
      this.logger.error(err, '未知错误');
      throw new NewHttpException('未知错误');
    }
  }
  //添加访客记录
  public async addVisitor(
    visitorUserId: number,
    userId?: number,
  ): Promise<void> {
    if (!userId) return;
    const currentTime: number = new Date().getTime();
    await this.visitorRepository.save({
      userId,
      visitorUserId,
      time: currentTime,
    });
  }

  // 用户签到
  public async sigIn(userId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const experience: UserExperienceEntity | undefined =
      await queryRunner.manager.findOne(UserExperienceEntity, {
        where: {
          userId,
        },
      });

    try {
      if (typeof experience === 'undefined') {
        await queryRunner.manager.save(UserExperienceEntity, {
          userId,
          experience: 3,
        });
        await queryRunner.commitTransaction();
      } else {
        const todayIsExists = await queryRunner.manager
          .createQueryBuilder(UserExperienceEntity, 'ue')
          .where(
            `to_days(ue.updateAt) = to_days("${Moment().format(
              'YYYY-MM-DD',
            )}")`,
          )
          .andWhere('ue.user_id = :userId', { userId })
          .getOne();

        if (typeof todayIsExists !== 'undefined') {
          throw new Error('今天已经签到过了呦~');
        }
        const obj = {
          experience: experience.experience + 3,
          grade: experience.grade,
        };
        const grade = +(experience.experience / 5).toFixed(0);
        if (grade !== experience.grade) {
          obj.grade = grade;
        }
        await queryRunner.manager.update(
          UserExperienceEntity,
          { userId },
          { experience: experience.experience + 3 },
        );
        await queryRunner.commitTransaction();
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.message === '今天已经签到过了呦~') {
        throw new NewHttpException(err.message);
      }
      this.logger.error(err, '签到出错');
      throw new NewHttpException('签到出错');
    } finally {
      await queryRunner.release();
    }
  }

  //   更改用户背景
  public async changeUserBg(userId: number, url: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { bgUrl: url });
  }
}
