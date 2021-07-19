import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserBind } from './UserBind';
import { Userinfo } from './Userinfo';

@Index('IDX_fe0bb3f6520ee0469504521e71', ['username'], { unique: true })
@Index('IDX_97672ac88f789774dd47f7c8be', ['email'], { unique: true })
@Index('IDX_a000cca60bcf04454e72769949', ['phone'], { unique: true })
@Index('userinfo_id-user_id', ['userinfoId'], {})
@Entity('users', { schema: 'joke' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '用户id' })
  id: number;

  @Column('varchar', {
    name: 'username',
    nullable: true,
    unique: true,
    comment: '用户名',
    length: 30,
  })
  username: string | null;

  @Column('text', { name: 'avatar', nullable: true, comment: '头像' })
  avatar: string | null;

  @Column('varchar', {
    name: 'email',
    nullable: true,
    unique: true,
    comment: '邮箱',
    length: 100,
  })
  email: string | null;

  @Column('timestamp', {
    name: 'createAt',
    nullable: true,
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date | null;

  @Column('timestamp', {
    name: 'updateAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date | null;

  @Column('int', {
    name: 'status',
    nullable: true,
    comment: '0禁用 1启用',
    default: 0,
  })
  status: number | null;

  @Column('char', {
    name: 'phone',
    nullable: true,
    unique: true,
    comment: '手机号',
    length: 11,
  })
  phone: string | null;

  @Column('varchar', {
    name: 'nickname',
    nullable: true,
    comment: '用户昵称',
    length: 50,
  })
  nickname: string | null;

  @Column('int', {
    name: 'userinfo_id',
    nullable: true,
    comment: '用户详情的id',
  })
  userinfoId: number | null;

  @Column('varchar', { name: 'password', comment: '密码', length: 300 })
  password: string;

  @OneToMany(() => UserBind, (userBind) => userBind.user)
  userBinds: UserBind[];

  @ManyToOne(() => Userinfo, (userinfo) => userinfo.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userinfo_id', referencedColumnName: 'id' }])
  userinfo: Userinfo;
}
