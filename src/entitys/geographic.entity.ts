import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('parent_id', ['parentId'], {})
@Index('ctype', ['ctype'], {})
@Entity('geographic', { schema: 'joke' })
export class GeographicEntity {
  @PrimaryGeneratedColumn({ type: 'smallint', name: 'id', unsigned: true })
  id: number;

  @Column('smallint', {
    name: 'parent_id',
    unsigned: true,
    default: () => "'0'",
  })
  parentId: number;

  @Column('varchar', { name: 'place_name', length: 120 })
  placeName: string;

  @Column('tinyint', { name: 'ctype', width: 1, default: () => "'2'" })
  ctype: boolean;
}
