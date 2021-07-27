import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { UsersEntity } from './users.entity';
@Index('user_id', ['userId'])
@Entity('userinfo', { schema: 'joke' })
export class UserinfoEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'gender', nullable: true, comment: '0男 1女 2保密' })
  gender: number | null;

  @Column('int', { name: 'age', nullable: true, comment: '年龄' })
  age: number | null;

  @Column('varchar', {
    name: 'emotion',
    nullable: true,
    comment: '情感',
    length: 30,
  })
  emotion: string | null;

  @Column('varchar', {
    name: 'job',
    nullable: true,
    comment: '工作类型',
    length: 30,
  })
  job: string | null;

  @Column('bigint', { name: 'birthday', nullable: true, comment: '生日' })
  birthday: string | null;

  @Column('varchar', {
    name: 'hometown',
    nullable: true,
    comment: '家乡',
    length: 50,
  })
  hometown: string | null;

  /* @OneToMany(() => UsersEntity, (users) => users.userinfo)
  users: UsersEntity[];*/

  @Column('int', {
    name: 'user_id',
    comment: '用户的id',
  })
  userId: number;

  @ManyToOne(() => UsersEntity, (user) => user.userinfo, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;
}
