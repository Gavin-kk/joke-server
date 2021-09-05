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

@Index('user_id', ['userId'], {})
@Index('follow_id', ['followId'], {})
@Entity('follow', { schema: 'joke' })
export class FollowEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id', comment: '用户的id' })
  userId: number;

  @Column('int', { name: 'follow_id', comment: '被关注的人' })
  followId: number;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @ManyToOne(() => UsersEntity, (users) => users.follows, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(() => UsersEntity, (users) => users.followed, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'follow_id', referencedColumnName: 'id' }])
  follow: UsersEntity;
}
