import { HttpModule, Module } from '@nestjs/common';
import { GeographyService } from './geography.service';
import { GeographyController } from './geography.controller';

@Module({
  imports: [HttpModule.register({})],
  controllers: [GeographyController],
  providers: [GeographyService],
})
export class GeographyModule {}
