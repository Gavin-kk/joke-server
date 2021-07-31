import WebSocket from 'ws';
import { UsersEntity } from '@src/entitys/users.entity';

export interface IWs extends WebSocket {
  user: UsersEntity;
}

export interface IWsResponse {
  event: string;
  data: any;
}
