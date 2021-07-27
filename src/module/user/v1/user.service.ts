import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { EditPasswordDto } from '@src/module/user/v1/dto/edit-password.dto';
import { RedisServiceN } from '@src/lib/redis/redis.service';
import {
  REDIS_EDIT_EMAIL_KEY_METHOD,
  REDIS_EDIT_PASSWORD_KEY_METHOD,
  REDIS_EMAIL_KEY_METHOD,
} from '@src/common/constant/email.constant';
import { hashSync } from 'bcryptjs';
import { TOKEN_REDIS_KEY_METHOD } from '@src/common/constant/auth.constant';
import { EditEmailDto } from '@src/module/user/v1/dto/edit-email.dto';
import { EditUserinfoDto } from '@src/module/user/v1/dto/edit-userinfo.dto';
import { UserinfoEntity } from '@src/entitys/userinfo.entity';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
export class UserService {
  private logger: Logger = new Logger('UserService');
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(UserinfoEntity)
    private readonly userinfoRepository: Repository<UserinfoEntity>,
    private readonly redisService: RedisServiceN,
  ) {}

  public async searchUser(content: string): Promise<UsersEntity | null> {
    if (!content) throw new NewHttpException('参数错误');
    return (
      (await this.usersRepository
        .createQueryBuilder('u')
        .where('CONCAT(u.username,u.email,u.nickname)  like :content', {
          content: `%${content}%`,
        })
        .getOne()) || null
    );
  }

  public async editPassword(
    { VCode, newPassword }: EditPasswordDto,
    user: UsersEntity,
  ): Promise<void> {
    // 检查验证码
    const VCodeIsExists: number | null = await this.redisService.get(
      REDIS_EDIT_PASSWORD_KEY_METHOD(user.email),
    );
    if (VCodeIsExists === null || VCode !== VCodeIsExists) throw new NewHttpException('验证码错误');

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
  public async editEmail({ VCode, newEmail }: EditEmailDto, user: UsersEntity) {
    // 检查验证码
    const VCodeIsExists: number | null = await this.redisService.get(
      REDIS_EDIT_EMAIL_KEY_METHOD(user.email),
    );
    if (VCodeIsExists === null || VCode !== VCodeIsExists) throw new NewHttpException('验证码错误');
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
      throw new NewHttpException('更新失败');
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
    { nickname, gender, hometown, birthday, job, emotion, age }: EditUserinfoDto,
    userId: number,
  ): Promise<string> {
    try {
      // 修改用户昵称
      if (nickname) {
        await this.usersRepository.update({ id: userId }, { nickname });
      }
      //  修改详情 userinfo表
      await this.userinfoRepository.update(
        { userId },
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
}
