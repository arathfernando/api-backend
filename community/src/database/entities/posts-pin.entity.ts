import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { CommunityTimeline } from './timeline.entity';

@Entity('post_pin', { orderBy: { id: 'ASC' } })
export class PostPin {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToOne(() => CommunityTimeline, (z) => z.post_pin, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'timeline_id',
    referencedColumnName: 'id',
  })
  timeline_post: CommunityTimeline;

  @Column()
  user_id: number;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
