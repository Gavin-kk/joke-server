import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity('update', { schema: 'joke' })
export class UpdateEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('text', { name: 'download_link', comment: 'app下载地址' })
  downloadLink: string;

  @Column('varchar', { name: 'version', comment: 'app版本', length: 100 })
  version: string;

  @Column('int', {
    name: 'status',
    comment: '0未上线 1上线',
    default: () => "'0'",
  })
  status: number;

  @CreateDateColumn()
  createAt: Timestamp;

  @UpdateDateColumn()
  updateAt: Timestamp;
}
