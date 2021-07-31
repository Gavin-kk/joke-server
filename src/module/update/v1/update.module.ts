import { Module } from '@nestjs/common';
import { UpdateService } from './update.service';
import { UpdateController } from './update.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateEntity } from '@src/entitys/update.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UpdateEntity])],
  controllers: [UpdateController],
  providers: [UpdateService],
})
export class UpdateModule {}
