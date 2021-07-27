import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { TopicEntity } from './topic.entity';

@Entity('topic-classify', { schema: 'joke' })
export class TopicClassifyEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title', comment: '话题分类的标题', length: 30 })
  title: string;

  @Column('int', {
    name: 'status',
    nullable: true,
    comment: '话题分类的状态 0可见 1表示被禁用',
    default: () => '0',
  })
  status: number | null;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;

  @OneToMany(() => TopicEntity, (TopicEntity) => TopicEntity.topicClassify)
  topics: TopicEntity[];
}
