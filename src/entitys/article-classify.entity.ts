import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { ArticleEntity } from './article.entity';

@Entity('article-classify', { schema: 'joke' })
export class ArticleClassifyEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title', comment: '文章分类的标题', length: 30 })
  title: string;

  @Column('int', {
    name: 'status',
    nullable: true,
    comment: '文章分类的状态 0可见 1表示被禁用',
    default: () => 0,
  })
  status: number | null;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @OneToMany(() => ArticleEntity, (ArticleEntity) => ArticleEntity.articleClassify)
  articles: ArticleEntity[];
}
