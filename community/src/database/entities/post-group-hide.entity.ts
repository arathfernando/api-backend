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
import { CommunityGroupTimeline } from './group-timeline.entity';

@Entity('group_post_hide')
export class GroupPostHide {
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

  @ManyToOne(() => CommunityGroupTimeline, (ct) => ct.group_post_hide, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_timeline_id',
  })
  group_timeline_post: CommunityGroupTimeline;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
