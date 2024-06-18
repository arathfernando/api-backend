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
import { CommunityTimeline } from './timeline.entity';

@Entity('post_like')
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'community_id', type: 'varchar', default: null })
  community_id: number;

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

  @ManyToOne(() => CommunityTimeline, (ct) => ct.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'timeline_post_id',
  })
  timeline_post: CommunityTimeline;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
