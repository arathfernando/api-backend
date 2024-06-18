import { HIDE_UNHIDE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityTimeline } from './timeline.entity';

@Entity('post_hide')
export class PostHide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'post_status',
    type: 'enum',
    enum: HIDE_UNHIDE,
    default: null,
  })
  post_status: HIDE_UNHIDE;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @ManyToOne(() => CommunityTimeline, (ct) => ct.post_hide, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'timeline_id',
  })
  timeline_post: CommunityTimeline;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
