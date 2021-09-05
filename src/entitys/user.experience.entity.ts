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
@Entity('user_experience', { schema: 'joke' })
export class UserExperienceEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id', comment: '经验所属的用户' })
  userId: number;

  @Column('int', {
    name: 'experience',
    comment: '用户的经验条',
    default: () => 0,
  })
  experience: number;

  @Column('int', { name: 'grade', comment: '用户等级', default: () => 0 })
  grade: number;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @ManyToOne(() => UsersEntity, (users) => users.userExperiences, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;
}
