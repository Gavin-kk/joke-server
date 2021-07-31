import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from './users.entity';

@Index('user_id', ['userId'], {})
@Index('visitor_user_id', ['visitorUserId'], {})
@Entity('visitor', { schema: 'joke' })
export class VisitorEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'visitor_user_id', comment: '被访问者id' })
  visitorUserId: number;

  @Column('int', { name: 'user_id', comment: '用户的id 也就是访问者的id' })
  userId: number;

  @Column('bigint', { name: 'time' })
  time: number;

  @ManyToOne(() => UsersEntity, (users) => users.visitors, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(() => UsersEntity, (users) => users.interviewee, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'visitor_user_id', referencedColumnName: 'id' }])
  visitorUser: UsersEntity;
}
