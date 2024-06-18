import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('badges', { orderBy: { id: 'ASC' } })
export default class Badge {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'badge_name', type: 'varchar', default: null })
  badge_name: string;

  @Column({ name: 'badge_category', type: 'varchar', default: null })
  badge_category: string;

  @Column({ name: 'badge_image', type: 'varchar', default: null })
  badge_image: string;

  @Column({ name: 'level', type: 'text', default: null })
  level: string;

  @Column({ name: 'hbb_points', type: 'text', default: null })
  hbb_points: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
