import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './Users';

@Entity('userinfo', { schema: 'joke' })
export class Userinfo {
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

  @Column('bigint', { name: 'birthday', nullable: true })
  birthday: string | null;

  @Column('varchar', {
    name: 'hometown',
    nullable: true,
    comment: '家乡',
    length: 50,
  })
  hometown: string | null;

  @OneToMany(() => Users, (users) => users.userinfo)
  users: Users[];
}
