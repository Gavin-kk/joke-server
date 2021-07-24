import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TopicEntity } from './topic.entity';
import { ArticleEntity } from './article.entity';

@Index('IDX_e39d72d3f8b136470a11dc3bc2', ['articleId'], {})
@Index('IDX_700192d70bcd2fd2e909a5760f', ['topicId'], {})
@Entity('topic_articles_article', { schema: 'joke' })
export class TopicArticlesEntity {
  @PrimaryColumn({
    type: 'int',
    primary: true,
    name: 'topicId',
  })
  topicId: number;

  @PrimaryColumn({
    type: 'int',
    primary: true,
    name: 'articleId',
  })
  articleId: number;

  @ManyToOne(() => TopicEntity, (TopicEntity) => TopicEntity.articles, {
    primary: true,
  })
  @JoinColumn({ name: 'topicId' })
  topic: TopicEntity;

  @ManyToOne(() => ArticleEntity, (ArticleEntity) => ArticleEntity.topics, {
    primary: true,
  })
  @JoinColumn({ name: 'articleId' })
  article: ArticleEntity;

  // @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  // id: number;
  //
  // @Column('int', { name: 'topic_id' })
  // topicId: number;
  //
  // @Column('int', { name: 'article_id' })
  // articleId: number;
  //
  // @Column('timestamp', {
  //   name: 'createAt',
  //   nullable: true,
  //   default: () => 'CURRENT_TIMESTAMP',
  // })
  // createAt: Date | null;
  //
  // @Column('timestamp', {
  //   name: 'updateAt',
  //   nullable: true,
  //   default: () => 'CURRENT_TIMESTAMP',
  // })
  // updateAt: Date | null;

  // @ManyToOne(() => TopicEntity, (topic) => topic.topicArticles, {
  //   onDelete: 'NO ACTION',
  //   onUpdate: 'NO ACTION',
  // })
  // @JoinColumn([{ name: 'topic_id', referencedColumnName: 'id' }])
  // topic: TopicEntity;
  //
  // @ManyToOne(() => ArticleEntity, (article) => article.topicArticles, {
  //   onDelete: 'NO ACTION',
  //   onUpdate: 'NO ACTION',
  // })
  // @JoinColumn([{ name: 'article_id', referencedColumnName: 'id' }])
  // article: ArticleEntity;
}
