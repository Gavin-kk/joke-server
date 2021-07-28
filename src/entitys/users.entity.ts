import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
} from 'typeorm';
import { UserBindEntity } from './user-bind.entity';
import { UserinfoEntity } from './userinfo.entity';
import { hashSync } from 'bcryptjs';
import { ArticleEntity } from './article.entity';
import { CommentEntity } from './comment.entity';
import { Exclude } from 'class-transformer';
import { UserArticleLikeEntity } from './user-article-like.entity';
import { BlackListEntity } from './black-list.entity';
import { FollowEntity } from './follow.entity';
import { FeedbackEntity } from './feedback.entity';
import { RolesEntity } from './roles.entity';

@Index('IDX_fe0bb3f6520ee0469504521e71', ['username'], { unique: true })
@Index('IDX_97672ac88f789774dd47f7c8be', ['email'], { unique: true })
@Index('IDX_a000cca60bcf04454e72769949', ['phone'], { unique: true })
// @Index('userinfo_id-user_id', ['userinfoId'], {})
@Entity('users', { schema: 'joke' })
export class UsersEntity {
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

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

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

  @Exclude()
  @Column('varchar', {
    name: 'password',
    comment: '密码',
    length: 300,
    transformer: {
      to(value: string): string {
        return hashSync(value);
      },
      from(value: string): string {
        return value;
      },
    },
  })
  password: string;

  @OneToMany(() => ArticleEntity, (article) => article.user)
  articles: ArticleEntity[];

  @OneToMany(() => CommentEntity, (CommentEntity) => CommentEntity.user)
  comments: CommentEntity[];

  @OneToMany(() => UserBindEntity, (userBind) => userBind.user)
  userBinds: UserBindEntity[];

  @OneToMany(() => UserinfoEntity, (usersinfo) => usersinfo.user)
  userinfo: UsersEntity[];

  @OneToMany(() => UserArticleLikeEntity, (userArticlesLike) => userArticlesLike.user)
  userArticlesLikes: UserArticleLikeEntity[];

  @OneToMany(() => BlackListEntity, (blackList) => blackList.user)
  blackLists: BlackListEntity[];

  @OneToMany(() => BlackListEntity, (blackList) => blackList.blackUser)
  blackLists2: BlackListEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.user)
  follows: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.follow)
  followed: FollowEntity[];

  @OneToMany(() => FeedbackEntity, (feedback) => feedback.user)
  feedbacks: FeedbackEntity[];

  @OneToMany(() => RolesEntity, (roles) => roles.user)
  roles: RolesEntity[];
}
