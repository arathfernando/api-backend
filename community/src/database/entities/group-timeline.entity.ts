import { POST_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupPostLike } from './group-post-like.entity';
import { GroupPostComments } from './group-comments.entity';
import { GroupPostHide } from './post-group-hide.entity';

@Entity('community_group_timeline')
export class CommunityGroupTimeline {
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

  @OneToMany(() => GroupPostLike, (pl) => pl.group_timeline_post)
  likes: GroupPostLike[];

  @OneToMany(() => GroupPostComments, (group_comments) => group_comments.post)
  group_comments: GroupPostComments[];

  @OneToMany(() => GroupPostHide, (c) => c.group_timeline_post)
  group_post_hide: GroupPostHide[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
