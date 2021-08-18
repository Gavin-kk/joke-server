import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('like-count', { schema: 'joke' })
export class LikeCountEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'target_user_id', comment: '本条消息的目标用户' })
  targetUserId: number;

  @Column('int', { name: 'count', comment: '点赞消息的数量 ' })
  count: number;
}
