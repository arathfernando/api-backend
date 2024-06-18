import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AreaShare from './area.entity';

@Entity('zones', { orderBy: { id: 'ASC' } })
export default class Zone {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'area_name', type: 'varchar', default: null })
  area_name: string;

  @Column({ name: 'subarea_name', type: 'varchar', default: null })
  subarea_name: string;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @Column({ name: 'community_id', type: 'int', default: null })
  community_id: number;

  @Column({ name: 'created_at_date', type: 'text', default: null })
  created_at_date: string;

  @OneToOne(() => AreaShare, (a) => a.zone, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'area_share_id',
    referencedColumnName: 'id',
  })
  area_share_id: AreaShare;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
