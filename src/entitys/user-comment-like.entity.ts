import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { CommentEntity } from './comment.entity';
import { ReplyEntity } from '@src/entitys/reply.entity';

@Index('comment_id', ['commentId'], {})
@Index('reply_id', ['replyId'], {})
@Index('user_id', ['userId'], {})
@Entity('user_comment_like', { schema: 'joke' })
export class UserCommentLikeEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id', comment: '点赞的用户' })
  userId: number;

  @Column('int', {
    name: 'comment_id',
    nullable: true,
    comment: '一级评论的id',
  })
  commentId: number | null;

  @Column('int', { name: 'reply_id', nullable: true, comment: '二级评论的id' })
  replyId: number | null;

  @Column('timestamp', {
    name: 'createAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date | null;

  @Column('timestamp', {
    name: 'updateAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date | null;

  @ManyToOne(() => UsersEntity, (users) => users.userCommentLikes, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.userCommentLikes, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'comment_id', referencedColumnName: 'id' }])
  comment: CommentEntity;

  @ManyToOne(() => ReplyEntity, (reply) => reply.userCommentLikes, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'reply_id', referencedColumnName: 'id' }])
  reply: ReplyEntity;
}
