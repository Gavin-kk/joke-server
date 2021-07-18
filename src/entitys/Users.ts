import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Userinfo } from './Userinfo';
import { UserBind } from './UserBind';

@Index('user_bind_id-user_id', ['userBindId'], {})
@Index('userinfo_id-user_id', ['userinfoId'], {})
@Entity('users', { schema: 'joke' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: '用户id' })
  id: number;

  @Column('varchar', {
    name: 'username',
    nullable: true,
    comment: '用户名',
    length: 30,
  })
  username: string | null;

  @Column('varchar', { name: 'password', comment: '密码', length: 50 })
  password: string;

  @Column('text', { name: 'avatar', nullable: true, comment: '头像' })
  avatar: string | null;

  @Column('varchar', {
    name: 'email',
    nullable: true,
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

  @Column('int', { name: 'status', nullable: true, comment: '0禁用 1启用' })
  status: number | null;

  @Column('char', {
    name: 'phone',
    nullable: true,
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

  @Column('int', {
    name: 'user_bind_id',
    nullable: true,
    comment: '用户绑定的第三方账号',
  })
  userBindId: number | null;

  @ManyToOne(() => Userinfo, (userinfo) => userinfo.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'userinfo_id', referencedColumnName: 'id' }])
  userinfo: Userinfo;

  @ManyToOne(() => UserBind, (userBind) => userBind.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_bind_id', referencedColumnName: 'id' }])
  userBind: UserBind;
}
