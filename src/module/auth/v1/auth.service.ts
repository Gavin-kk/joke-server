import { Injectable, Logger } from '@nestjs/common';
import { RedisServiceN } from 'src/lib/redis/redis.service';
import { NewHttpException } from '@src/common/exception/customize.exception';
import { EmailLoginDto } from './dto/email-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Connection, InsertResult, QueryRunner, Repository } from 'typeorm';
import { length } from 'class-validator';
import { TOKEN_EXPIRED } from '@src/common/constant/auth.constant';
import { JwtService } from '@nestjs/jwt';
import { OtherLoginDto } from './dto/other-login.dto';
import { UserBindEntity } from '../../../entitys/user-bind.entity';
import {
  REDIS_EMAIL_KEY_METHOD,
  REDIS_LOGIN_KEY_METHOD,
} from '@src/common/constant/email.constant';
import { OtherBindEmailDto } from '@src/module/auth/v1/dto/other-bind-email.dto';
import { UserinfoEntity } from '@src/entitys/userinfo.entity';

export interface IAuthServiceOtherLoginError {
  text: string;
  userBindId: number;
}

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService');

  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(UserBindEntity)
    private readonly userBindRepository: Repository<UserBindEntity>,
    @InjectRepository(UserinfoEntity)
    private readonly userInfoRepository: Repository<UserinfoEntity>,
    private readonly redisService: RedisServiceN,
    private readonly jwtService: JwtService,
    private readonly connection: Connection,
  ) {}

  // 验证邮箱登录
  public async verifyLogin(emailLoginDto: EmailLoginDto): Promise<UsersEntity> {
    // 验证验证码是否正确
    await this.checkVCode(emailLoginDto.email, emailLoginDto.VCode);
    // 如果用户存在 那么返回用户 如果用户不存在则创建用户
    // 判断用户是否存在
    const user: UsersEntity | undefined = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userinfo', 'userinfo')
      .where({ email: emailLoginDto.email })
      .getOne();

    if (user) {
      // 检查用户是否黑名单
      this.checkIfTheUserIsBlacklisted(user);
      return user;
    } else if (emailLoginDto.password) {
      // 验证密码格式是否正确
      if (!length(emailLoginDto.password, 6, 18)) {
        throw new NewHttpException('密码格式错误', 400);
      }

      try {
        // 创建新用户
        const userInsert: InsertResult = await this.userRepository
          .createQueryBuilder()
          .insert()
          .into(UsersEntity)
          .values({
            email: emailLoginDto.email,
            username: emailLoginDto.email,
            password: emailLoginDto.password,
          })
          .execute();
        //生成用户详情表
        await this.userInfoRepository.save({
          userId: userInsert.identifiers[0].id,
        });
        // 返回 查询用户
        return this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.userinfo', 'userinfo')
          .where({ email: emailLoginDto.email })
          .getOne();
      } catch (err) {
        this.logger.error(err, '注册用户失败 AuthService');
        throw new NewHttpException('注册用户失败', 400);
      }
    } else {
      // 如果用户是第一次使用该邮箱登录 返回用户不存在 让前端跳转到绑定初始密码页面 然后再次请求本接口即可获取token
      throw new NewHttpException('请绑定初始密码', 404);
    }
  }

  // 第三方登录
  public async otherLogin({
    openid,
    type,
    avatar,
    nickname,
  }: OtherLoginDto): Promise<IAuthServiceOtherLoginError | UsersEntity> {
    // 先验证是否存在该第三方登录的数据
    const isExists: UserBindEntity | undefined = await this.userBindRepository.findOne({
      openid,
      type,
    });
    // 如果不存在 则在表中记录该用户第三方登录数据 然后抛出异常让前端处理跳转到绑定邮箱密码页面
    if (!isExists) {
      const result: InsertResult = await this.userBindRepository
        .createQueryBuilder()
        .insert()
        .into(UserBindEntity)
        .values({ type, openid, avatar, nickname })
        .execute();

      return {
        text: '请绑定邮箱',
        userBindId: result.generatedMaps[0].id,
      } as IAuthServiceOtherLoginError;
    }
    // 防止跳过首次登录绑定邮箱
    if (isExists && !isExists.userId) {
      return {
        text: '请绑定邮箱',
        userBindId: isExists.id,
      } as IAuthServiceOtherLoginError;
    }

    const user: UsersEntity = await this.userRepository.findOne({
      id: isExists.userId,
    });
    // 验证用户是否黑名单
    this.checkIfTheUserIsBlacklisted(user);
    return user;
  }

  public async otherLoginBindEmail({
    password,
    VCode,
    email,
    userBindId,
  }: OtherBindEmailDto): Promise<UsersEntity> {
    // 验证验证码是否正确
    await this.checkVCode(email, VCode);
    // 首先验证该邮箱或者说用户是否已经存在了
    const emailIsBind: UsersEntity | undefined = await this.userRepository.findOne({
      email,
    });

    if (emailIsBind) {
      // 检查用户被封
      this.checkIfTheUserIsBlacklisted(emailIsBind);
      //  要绑定的邮箱存在 和当前用户直接绑定 无视密码
      await this.userBindRepository
        .createQueryBuilder()
        .update()
        .set({ userId: emailIsBind.id })
        .where('id = :userBindId', { userBindId })
        .execute();
      return emailIsBind;
    } else {
      //  生成用户 和 绑定userBindid 生成userinfo数据
      // 开启数据库事务
      const queryRunner: QueryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction('REPEATABLE READ');
      try {
        // 创建用户
        const user: InsertResult = await queryRunner.manager
          .createQueryBuilder(UsersEntity, 'user')
          .insert()
          .values({ email, password, username: email })
          .execute();
        // 创建用户详情
        await queryRunner.manager
          .createQueryBuilder(UserinfoEntity, 'userinfo')
          .insert()
          .values({ userId: user.identifiers[0].id }) // 只是没有信息
          .execute();
        // 和以创建的绑定信息绑定邮箱
        await queryRunner.manager
          .createQueryBuilder(UserBindEntity, 'bind')
          .update()
          .set({ userId: user.identifiers[0].id })
          .where('id = :userBindId', { userBindId })
          .execute();
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error(err, '第三方账号绑定用户,邮箱出错');
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
    return await this.userRepository.findOne({
      email,
    });
  }

  // 生成token
  public generateToken(id: number, password: string): string {
    return this.jwtService.sign({ id, password }, { expiresIn: TOKEN_EXPIRED });
  }

  //检查用户是否黑名单
  private checkIfTheUserIsBlacklisted(user: UsersEntity): void {
    if (user.status === 1) {
      throw new NewHttpException('用户违反用户协定, 已被封禁', 403);
    }
  }

  // 验证验证码是否正确
  private async checkVCode(email: string, VCode: number): Promise<void> {
    // 验证邮箱和密码是否正确
    const redisEmailCodeIsExists: number | null = await this.redisService.get(
      REDIS_LOGIN_KEY_METHOD(email),
    );
    // 验证验证码是否正确
    if (redisEmailCodeIsExists !== VCode) {
      throw new NewHttpException('验证码错误');
    }
  }
}
