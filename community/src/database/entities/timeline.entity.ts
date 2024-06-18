import { POST_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostLike } from './post-like.entity';
import { Comments } from './comments.entity';
import { PostReport } from './posts-report.entity';
import { PostPin } from './posts-pin.entity';
import { PostHide } from './post-hide.entity';

@Entity('community_timeline')
export class CommunityTimeline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'varchar', default: null })
  post_id: number;

  @Column({ name: 'community_id', type: 'varchar', default: null })
  community_id: number;

  @Column({
    name: 'post_type',
    type: 'enum',
    enum: POST_TYPE,
    default: null,
  })
  post_type: POST_TYPE;

  @OneToMany(() => PostLike, (pl) => pl.timeline_post)
  likes: PostLike[];

  @OneToMany(() => Comments, (c) => c.timeline_post)
  comments: Comments[];

  @OneToMany(() => PostReport, (c) => c.timeline_post)
  post_report: PostReport[];

  @OneToOne(() => PostPin, (z) => z.timeline_post, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'post_pin',
    referencedColumnName: 'id',
  })
  post_pin: PostPin | null;

  @OneToMany(() => PostHide, (c) => c.timeline_post)
  post_hide: PostHide[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
