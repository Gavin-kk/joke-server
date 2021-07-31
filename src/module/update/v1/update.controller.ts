import { Controller, Get, Query } from '@nestjs/common';
import { UpdateService } from './update.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import { checkFormat } from '@src/module/update/v1/dto/update.schema';

@ApiTags('app更新模块')
@Controller('api/v1/update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @ApiOperation({ summary: '检查app版本更新' })
  @Get()
  public async checkAppUpdate(
    @Query('version', new LineCheckTransformPipe(checkFormat)) currentVersion: string,
  ) {
    return this.updateService.checkAppUpdate(currentVersion);
  }
}
