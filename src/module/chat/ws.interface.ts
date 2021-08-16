import WebSocket from 'ws';
import { UsersEntity } from '@src/entitys/users.entity';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export interface IWs extends WebSocket {
  user: UsersEntity;
}

export interface IWsResponse {
  event: string;
  data: any;
}
export interface IChatMsg {
  content: string;
  type: string;
  targetUserId?: number;
  avatar: string;
  time: number;
  user: UsersEntity;
}
