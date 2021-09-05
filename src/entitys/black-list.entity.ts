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

@Index('black_user_id', ['blackUserId'], {})
@Index('user_id', ['userId'], {})
@Entity('black-list', { schema: 'joke' })
export class BlackListEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id', comment: '当前用户' })
  userId: number;

  @Column('int', { name: 'black_user_id', comment: '拉黑谁' })
  blackUserId: number;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @ManyToOne(() => UsersEntity, (users) => users.blackLists, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(() => UsersEntity, (users) => users.blackLists2, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'black_user_id', referencedColumnName: 'id' }])
  blackUser: UsersEntity;
}
