import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '@src/entitys/users.entity';
import { Repository } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  public async searchUser(content: string): Promise<UsersEntity> {
    if (!content) throw new NewHttpException('参数错误');
    return this.usersRepository
      .createQueryBuilder('u')
      .where('CONCAT(`u.username`,`u.email`,`u.nickname`)  like :content', {
        content: `%${content}%`,
      })
      .getOne();
  }
}
