import { Injectable, Logger } from '@nestjs/common';
import { RedisServiceN } from 'src/lib/redis/redis.service';
import { NewHttpException } from '../../../common/exception/customize.exception';
import { EmailLoginDto } from './dto/email-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../entitys/Users';
import { InsertResult, Repository } from 'typeorm';
import { length } from 'class-validator';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService');

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly redisService: RedisServiceN,
  ) {}

  // 发送手机验证码
  async verifyLogin(emailLoginDto: EmailLoginDto): Promise<Users> {
    const result: number | null = await this.redisService.get(
      emailLoginDto.email,
    );
    if (!result || String(result) !== emailLoginDto.VCode) {
      throw new NewHttpException('验证码不正确', 400);
    }
    // 走到这里证明验证码时正确的
    // 如果用户存在 那么返回用户 如果用户不存在则创建用户
    // 判断用户是否存在
    const user: Users | undefined = await this.userRepository.findOne({
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
          .into(Users)
          .values({
            email: emailLoginDto.email,
            username: emailLoginDto.email,
            password: emailLoginDto.password,
          })
          .execute();
        // 查询用户
        return this.userRepository.findOne({
          email: emailLoginDto.email,
        });
      } catch (err) {
        this.logger.error(err, '注册用户失败 AuthService');
        throw new NewHttpException('注册用户失败', 400);
      }
    } else {
      throw new NewHttpException('用户不存在', 404);
    }
  }
}
