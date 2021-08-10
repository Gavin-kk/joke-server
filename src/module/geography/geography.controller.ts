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
            key: process.env.GAO_DE_KEY,
            location,
            extensions: 'all',
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
}
