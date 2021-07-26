import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TopicEntity } from './topic.entity';
import { ArticleEntity } from './article.entity';

@Index('IDX_892a55900acda8431a588cfb2e', ['topicId'], {})
@Index('IDX_b909afac1d6210d5098245da21', ['articleId'], {})
@Entity('topic_article', { schema: 'joke' })
export class TopicArticlesEntity {
  @PrimaryColumn({
    type: 'int',
    name: 'topicId',
  })
  topicId: number;

  @PrimaryColumn({
    type: 'int',
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
}
