import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '@src/entitys/users.entity';

@Entity('chat', { schema: 'joke' })
export class ChatEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('text', { name: 'content', comment: '消息的内容' })
  content: string;

  @Column('varchar', { name: 'type', comment: '消息的类型 ', length: 30 })
  type: string;

  @Column('int', { name: 'target_user_id', comment: '本条消息的目标用户' })
  targetUserId: number;

  @Column('text', { name: 'avatar', comment: '当前消息发送者的头像' })
  avatar: string;

  @Column('simple-json', { name: 'time', comment: '本条消息的时间戳' })
  time: number;

  @Column('simple-json', { name: 'user', comment: '当前消息发送者的信息' })
  user: UsersEntity;
}
