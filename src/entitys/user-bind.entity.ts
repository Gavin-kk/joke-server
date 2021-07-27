import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';

@Index('bind-users_id', ['userId'], {})
@Entity('user-bind', { schema: 'joke' })
export class UserBindEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', {
    name: 'type',
    comment: '第三方登录的类型 (微信, qq, 微博)...',
    length: 20,
  })
  type: string;

  @Column('text', { name: 'openid', comment: '第三方平台的openid' })
  openid: string;

  @Column('varchar', {
    name: 'nickname',
    nullable: true,
    comment: '第三方账号在第三方平台的昵称',
    length: 100,
  })
  nickname: string | null;

  @Column('text', { name: 'avatar', nullable: true, comment: '第三方头像' })
  avatar: string | null;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @Column('int', {
    name: 'user_id',
    nullable: true,
    comment: '第三方账号绑定的用户',
  })
  userId: number | null;

  @ManyToOne(() => UsersEntity, (users) => users.userBinds, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;
}
