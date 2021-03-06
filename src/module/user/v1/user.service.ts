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

  // ??????????????????
  public async getUserDetail(
    userIdT?: number,
    targetUserId?: number,
  ): Promise<UsersEntity> {
    let userId: number | undefined;
    if (!userIdT && !targetUserId) throw new NewHttpException('????????????');
    if ((targetUserId && userIdT) || (targetUserId && !userIdT)) {
      //  ???targetId
      userId = targetUserId;
    }
    if (userIdT && !targetUserId) {
      //  ????????????????????????
      userId = userIdT;
    }
    try {
      // ????????????
      const fans: { fansCount: string } = await this.usersRepository
        .createQueryBuilder('u')
        .leftJoin('u.followed', 'fans')
        .select('count(fans.follow_id) fansCount')
        .where('u.id = :userId', { userId })
        .getRawOne();
      // ????????????
      const follow: { followCount: string } = await this.usersRepository
        .createQueryBuilder('u')
        .leftJoin('u.follows', 'followed')
        .select('count(followed.user_id) followCount')
        .where('u.id = :userId', { userId })
        .getRawOne();
      // ?????????????????????
      const like: { likeCount: string } = await this.articleRepository
        .createQueryBuilder('art')
        .leftJoin('art.userArticlesLikes', 'ulike', 'ulike.is_like = 1')
        .select('count(ulike.is_like) likeCount')
        .where('ulike.user_id = :userId', { userId })
        .getRawOne();
      const query = this.usersRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.userinfo', 'info')
        // ???????????????????????????
        .loadRelationCountAndMap('u.totalVisitors', 'u.interviewee')
        // ??????????????????
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
        // ??????????????????????????????????????????
        user.isMe = true;
      }
      return user;
    } catch (err) {
      this.logger.error(err, '????????????????????????');
      throw new NewHttpException('???????????????');
    }
  }

  // ????????????
  public async blockUsers(
    { blackUserId }: BlockUserDto,
    currentUserId: number,
  ): Promise<string> {
    if (blackUserId === currentUserId)
      throw new NewHttpException('??????????????????');
    const queryRunner: QueryRunner = await this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');
    try {
      // ?????????????????????????????? ????????????????????????????????? ???????????????????????????
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
        return '????????????';
      } else {
        await queryRunner.manager.delete(BlackListEntity, {
          userId: currentUserId,
          blackUserId,
        });
        await queryRunner.commitTransaction();
        return '??????????????????';
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err, '???????????????????????????');
      throw new NewHttpException('???????????????????????????');
    } finally {
      await queryRunner.release();
    }
  }

  public async searchUser(content: string): Promise<UsersEntity[]> {
    if (!content) throw new NewHttpException('????????????');
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
    // ???????????????
    const VCodeIsExists: number | null = await this.redisService.get(
      REDIS_EDIT_PASSWORD_KEY_METHOD(user.email),
    );
    if (VCodeIsExists === null || VCode !== VCodeIsExists)
      throw new NewHttpException('???????????????');

    try {
      // ????????????
      await this.usersRepository
        .createQueryBuilder()
        .update()
        .set({ password: newPassword })
        .where('id = :id', { id: user.id })
        .execute();
      // ???token??????
      await this.redisService.del(TOKEN_REDIS_KEY_METHOD(user.email));
    } catch (err) {
      this.logger.error(err, '??????????????????');
      throw new NewHttpException('??????????????????');
    }
  }

  // ????????????
  public async editEmail(
    { VCode, newEmail, password }: EditEmailDto,
    user: UsersEntity,
  ): Promise<void> {
    // ??????????????????????????????
    if (!compareSync(password, user.password)) {
      throw new NewHttpException('????????????');
    }
    // ???????????????
    const VCodeIsExists: number | null = await this.redisService.get(
      REDIS_EDIT_EMAIL_KEY_METHOD(newEmail),
    );
    if (VCodeIsExists === null || VCode !== VCodeIsExists)
      throw new NewHttpException('???????????????');

    // ????????????
    try {
      await this.usersRepository
        .createQueryBuilder()
        .update()
        .set({ email: newEmail })
        .where('id = :id', { id: user.id })
        .execute();
      // ???token??????
      await this.redisService.del(TOKEN_REDIS_KEY_METHOD(user.email));
    } catch (err) {
      this.logger.error(err, '??????????????????');
      throw new NewHttpException('???????????? ???????????????????????????');
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
      return '????????????';
    } catch (err) {
      this.logger.error(err, '??????????????????');
      throw new NewHttpException('????????????', 400);
    }
  }
  // ??????????????????
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
      // ??????????????????
      if (nickname || avatar) {
        await this.usersRepository.update(
          { id: user.id },
          {
            nickname: nickname || null,
            avatar: avatar || user.avatar,
          },
        );
        // ???????????????????????????????????????????????????????????????????????????
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

      //  ???????????? userinfo???
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
      return '????????????';
    } catch (err) {
      this.logger.error(err, '????????????');
      throw new NewHttpException('????????????');
    }
  }
  //??????????????????
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

  // ????????????
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
          throw new Error('???????????????????????????~');
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
      if (err.message === '???????????????????????????~') {
        throw new NewHttpException(err.message);
      }
      this.logger.error(err, '????????????');
      throw new NewHttpException('????????????');
    } finally {
      await queryRunner.release();
    }
  }

  //   ??????????????????
  public async changeUserBg(userId: number, url: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { bgUrl: url });
  }
}
