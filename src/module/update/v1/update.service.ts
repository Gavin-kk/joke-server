import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateEntity } from '@src/entitys/update.entity';
import { Repository } from 'typeorm';
import { NewHttpException } from '@src/common/exception/customize.exception';

@Injectable()
export class UpdateService {
  private logger: Logger = new Logger('UpdateService');
  constructor(
    @InjectRepository(UpdateEntity)
    private readonly updateRepository: Repository<UpdateEntity>,
  ) {}

  public async checkAppUpdate(clientVersion: string) {
    if (clientVersion.split('.').length < 3) throw new NewHttpException('参数错误');

    try {
      const result: UpdateEntity = await this.updateRepository
        .createQueryBuilder()
        .orderBy('version', 'DESC')
        .getOne();
      return result.version !== clientVersion ? result : '您已经是最新版本了';
    } catch (err) {
      this.logger.error(err, '检查更新失败');
      throw new NewHttpException('检查更新失败');
    }
  }
}
