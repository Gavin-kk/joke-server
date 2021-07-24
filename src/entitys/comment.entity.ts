import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleEntity } from './article.entity';
import { UsersEntity } from './users.entity';

@Index('article_id-comment_article_id', ['articleId'], {})
@Index('target_id', ['targetId'], {})
@Index('user_id', ['userId'], {})
@Entity('comment', { schema: 'joke' })
export class CommentEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('text', { name: 'content', comment: '评论的内容' })
  content: string;

  @Column('int', {
    name: 'target_id',
    nullable: true,
    comment: '被回复评论的id 引用本表的id字段 如果为null 则为一级评论 ',
  })
  targetId: number | null;

  @Column('int', { name: 'user_id', comment: '用户的id' })
  userId: number;

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

  @Column('int', { name: 'article_id', comment: '被评论的动态id' })
  articleId: number;

  @ManyToOne(() => ArticleEntity, (ArticleEntity) => ArticleEntity.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'article_id', referencedColumnName: 'id' }])
  article: ArticleEntity;

  @ManyToOne(() => UsersEntity, (UsersEntity) => UsersEntity.comments, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'target_id', referencedColumnName: 'id' }])
  target: CommentEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.target)
  comments: CommentEntity[];
}
