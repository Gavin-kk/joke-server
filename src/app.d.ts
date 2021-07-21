import { FastifyRequest } from 'fastify';
import { UsersEntity } from '@src/entitys/users.entity';

declare interface IFastifyRequest extends FastifyRequest {
  user: UsersEntity;
}
