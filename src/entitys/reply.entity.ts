import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { CommentEntity } from './comment.entity';

@Index('comment_id', ['commentId'], {})
@Index('target_id', ['targetId'], {})
@Index('user_id', ['userId'], {})
@Entity('reply', { schema: 'joke' })
export class ReplyEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('text', { name: 'content', comment: '评论的内容' })
  content: string;

  @Column('int', {
    name: 'comment_id',
    comment: '被回复评论的一级评论的id 引用comment表的id字段 ',
  })
  commentId: number;

  @Column('int', {
    name: 'target_id',
    nullable: true,
    comment: '被回复评论的id 引用本表',
  })
  targetId: number | null;

  @Column('int', { name: 'user_id', comment: '用户的id' })
  userId: number;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @ManyToOne(() => UsersEntity, (users) => users.replies, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.reply, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'comment_id', referencedColumnName: 'id' }])
  comment: CommentEntity;

  @ManyToOne(() => ReplyEntity, (reply) => reply.replies, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'target_id', referencedColumnName: 'id' }])
  target: ReplyEntity;

  @OneToMany(() => ReplyEntity, (reply) => reply.target)
  replies: ReplyEntity[];
}
