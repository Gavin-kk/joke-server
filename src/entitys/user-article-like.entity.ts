import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { ArticleEntity } from './article.entity';

export const enum LikeType {
  tread,
  like,
}

@Index('article_id', ['articleId'], {})
@Index('user_id', ['userId'], {})
@Entity('user_articles_like', { schema: 'joke' })
export class UserArticleLikeEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', {
    name: 'is_like',
    comment: '0点踩 1 点赞 取消点赞就把本条记录删掉',
  })
  isLike: LikeType;

  @Column('int', { name: 'user_id', comment: '谁点赞或踩' })
  userId: number;

  @Column('int', { name: 'article_id', comment: '给哪个文章点赞或踩' })
  articleId: number;

  @CreateDateColumn()
  createAt: Date | null;

  @UpdateDateColumn()
  updateAt: Date | null;

  @ManyToOne(() => UsersEntity, (users) => users.userArticlesLikes, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: UsersEntity;

  @ManyToOne(() => ArticleEntity, (article) => article.userArticlesLikes, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'article_id', referencedColumnName: 'id' }])
  article: ArticleEntity;
}
