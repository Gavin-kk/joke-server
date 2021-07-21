import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TopicClassifyEntity } from './topic-classify.entity';

@Index('topic-classify_id', ['topicClassifyId'], {})
@Entity('topic', { schema: 'joke' })
export class TopicEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title', comment: '话题的标题', length: 30 })
  title: string;

  @Column('varchar', { name: 'pic', comment: '话题的封面', length: 200 })
  pic: string;

  @Column('varchar', { name: 'desc', comment: '话题的描述', length: 100 })
  desc: string;

  @Column('int', { name: 'topic-classify_id', comment: '话题分类的id' })
  topicClassifyId: number;

  @Column('int', {
    name: 'status',
    nullable: true,
    comment: '话题分类的状态 0可见 1表示被禁用',
    default: () => "'0'",
  })
  status: number | null;

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

  @ManyToOne(
    () => TopicClassifyEntity,
    (TopicClassifyEntity) => TopicClassifyEntity.topics,
    {
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    },
  )
  @JoinColumn([{ name: 'topic-classify_id', referencedColumnName: 'id' }])
  topicClassify: TopicClassifyEntity;
}
