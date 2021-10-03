import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeographicEntity } from '@src/entitys/geographic.entity';

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(GeographicEntity)
    private readonly geographicRepository: Repository<GeographicEntity>,
  ) {}

  public async findAll(id = 1) {
    return this.geographicRepository.find({ parentId: id });
  }
}
