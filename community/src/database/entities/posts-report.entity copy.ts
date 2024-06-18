import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CommunityTimeline } from './timeline.entity';

@Entity('post_report', { orderBy: { id: 'ASC' } })
export class PostReport {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'reason', type: 'varchar', default: null })
  reason: string;

  @Column({ name: 'response', type: 'varchar', default: null })
  response: string;

  @ManyToOne(() => CommunityTimeline, (ct) => ct.post_report, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'timeline_id',
  })
  timeline_post: CommunityTimeline;

  @Column()
  user_id: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
