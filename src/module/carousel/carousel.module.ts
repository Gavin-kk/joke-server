import { Module } from '@nestjs/common';
import { CarouselService } from './carousel.service';
import { CarouselController } from './carousel.controller';

@Module({
  controllers: [CarouselController],
  providers: [CarouselService]
})
export class CarouselModule {}
