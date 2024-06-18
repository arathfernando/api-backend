import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Community } from './community.entity';

@Entity('community_report', { orderBy: { id: 'ASC' } })
export class CommunityReport {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'reason', type: 'varchar', default: null })
  reason: string;

  @Column({ name: 'response', type: 'varchar', default: null })
  response: string;

  @ManyToOne(() => Community, (c) => c.community_reports, {
    onDelete: 'CASCADE',
  })
  community: Community;

  @Column()
  user_id: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
