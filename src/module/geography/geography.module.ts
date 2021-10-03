import { HttpModule, Module } from '@nestjs/common';
import { GeographyService } from './geography.service';
import { GeographyController } from './geography.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeographicEntity } from '@src/entitys/geographic.entity';

@Module({
  imports: [
    HttpModule.register({}),
    TypeOrmModule.forFeature([GeographicEntity]),
  ],
  controllers: [GeographyController],
  providers: [GeographyService],
})
export class GeographyModule {}
