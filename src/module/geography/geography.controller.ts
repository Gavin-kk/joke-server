import {
  Controller,
  Get,
  HttpService,
  Query,
  Res,
  Logger,
} from '@nestjs/common';
import { GeographyService } from './geography.service';
import { GeocodeDto } from '@src/module/geography/dto/geocode.dto';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { GeographicEntity } from '@src/entitys/geographic.entity';
import { LineCheckTransformPipe } from '@src/common/pipe/line-check-transform.pipe';
import { checkId } from '@src/module/comment/v1/dto/comment.schema';

@ApiTags('地理模块')
@Controller('api/v1/geography')
export class GeographyController {
  private logger: Logger = new Logger();
  constructor(
    private readonly geographyService: GeographyService,
    private readonly httpService: HttpService,
  ) {}

  @ApiOperation({ summary: '输入经纬度返回详细地址' })
  @Get('geocode')
  public geocode(
    @Query() { latitude, longitude }: GeocodeDto,
    @Res() res: FastifyReply,
  ): void {
    const location = `${(+longitude).toFixed(6)},${(+latitude).toFixed(6)}`;

    try {
      const result: Observable<AxiosResponse> = this.httpService.get(
        'https://restapi.amap.com/v3/geocode/regeo',
        {
          params: {
            location,
            extensions: 'all',
            key: process.env.GAO_DE_KEY,
          },
        },
      );
      result.subscribe((response: AxiosResponse) => {
        res.send(response.data.regeocode);
      });
    } catch (err) {
      this.logger.error(err.response.data, '获取逆地理信息出错');
    }
  }

  @ApiOperation({ summary: '省市区级联' })
  @Get('city')
  public city(
    @Query('id', new LineCheckTransformPipe(checkId)) id: number,
  ): Promise<GeographicEntity[]> {
    return this.geographyService.findAll(id);
  }
}
