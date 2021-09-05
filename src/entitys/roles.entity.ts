import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';

@Index('user_id', ['userId'], {})
@Entity('roles', { schema: 'joke' })
export class RolesEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'role', comment: '用户的角色', length: 50 })
  role: string;

  @Column('int', { name: 'user_id', comment: '用户的id' })
  userId: number;

  @ManyToOne(() => UsersEntity, (users) => users.roles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;
}
