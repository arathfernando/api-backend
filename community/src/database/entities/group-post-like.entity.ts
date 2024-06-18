import { POST_TYPE, REACTION_TYPE } from 'src/core/constant/enum.constant';
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

@Entity('group_post_like')
export class GroupPostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'varchar', default: null })
  post_id: number;

  @Column({ name: 'group_id', type: 'varchar', default: null })
  group_id: number;

  @Column({
    name: 'post_type',
    type: 'enum',
    enum: POST_TYPE,
    default: null,
  })
  post_type: POST_TYPE;

  @Column({
    name: 'reaction',
    type: 'enum',
    enum: REACTION_TYPE,
    default: null,
  })
  reaction: REACTION_TYPE;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @ManyToOne(() => CommunityGroupTimeline, (ct) => ct.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'post_id',
  })
  group_timeline_post: CommunityGroupTimeline;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
