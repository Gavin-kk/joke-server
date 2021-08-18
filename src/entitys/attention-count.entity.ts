import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attention-count', { schema: 'joke' })
export class AttentionCountEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'target_user_id', comment: '本条消息的目标用户' })
  targetUserId: number;

  @Column('int', { name: 'count', comment: '关注消息的数量 ' })
  count: number;
}
