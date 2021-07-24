import { Injectable, Logger } from '@nestjs/common';
import { RedisServiceN } from 'src/lib/redis/redis.service';
import { NewHttpException } from '../../../common/exception/customize.exception';
import { EmailLoginDto } from './dto/email-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../../../entitys/users.entity';
import { Connection, InsertResult, Repository } from 'typeorm';
import { length } from 'class-validator';
import { TOKEN_EXPIRED } from '../../../common/constant/auth.constant';
import { JwtService } from '@nestjs/jwt';
import { OtherLoginDto } from './dto/other-login.dto';
import { UserBindEntity } from '../../../entitys/user-bind.entity';
import { CurrentToken } from '../../../common/decorator/current-token.decorator';
import {
  REDIS_EMAIL_KEY_METHOD,
  REDIS_LOGIN_KEY_METHOD,
} from '@src/common/constant/email.constant';

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
    private readonly redisService: RedisServiceN,
    private readonly jwtService: JwtService,
  ) {}

  // 验证邮箱登录
  public async verifyLogin(emailLoginDto: EmailLoginDto): Promise<UsersEntity> {
    const redisEmailExists: number | null = await this.redisService.get(
      REDIS_LOGIN_KEY_METHOD(emailLoginDto.email),
    );
    if (!redisEmailExists || redisEmailExists !== emailLoginDto.VCode) {
      throw new NewHttpException('验证码不正确');
    }
    // 走到这里证明验证码时正确的
    // 如果用户存在 那么返回用户 如果用户不存在则创建用户
    // 判断用户是否存在
    const user: UsersEntity | undefined = await this.userRepository.findOne({
      email: emailLoginDto.email,
    });

    if (user) {
      return user;
    } else if (emailLoginDto.password) {
      // 验证密码格式是否正确
      if (!length(emailLoginDto.password, 6, 18)) {
        throw new NewHttpException('密码格式错误', 400);
      }

      try {
        // 创建新用户
        await this.userRepository
          .createQueryBuilder()
          .insert()
          .into(UsersEntity)
          .values({
            email: emailLoginDto.email,
            username: emailLoginDto.email,
            password: emailLoginDto.password,
          })
          .execute();
        // 返回 查询用户
        return this.userRepository.findOne({
          email: emailLoginDto.email,
        });
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
    const isExists: UserBindEntity | undefined =
      await this.userBindRepository.findOne({
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

    return await this.userRepository.findOne({
      id: isExists.userId,
    });
  }

  // 生成token
  public generateToken(id: number, password: string): string {
    return this.jwtService.sign({ id, password }, { expiresIn: TOKEN_EXPIRED });
  }

  //检查用户是否黑名单
  public async checkIfTheUserIsBlacklisted(user: UsersEntity): Promise<void> {
    if (user.status === 1) {
      throw new NewHttpException('用户违反用户协定, 已被封禁', 401);
    }
  }
}
