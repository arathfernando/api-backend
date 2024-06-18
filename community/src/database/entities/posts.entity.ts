import {
  POST_LOCATION,
  POST_SHARE_TYPE,
  POST_STATUS,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comments } from './comments.entity';
import { CommunityGroup } from './community-group.entity';
import { CommunityTopic } from './community-topic.entity';
import { Community } from './community.entity';
import { GroupPostComments } from './group-comments.entity';

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'content', type: 'text', default: null })
  content: string;

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @ManyToMany(() => CommunityTopic, (ct) => ct.posts, {
    onDelete: 'CASCADE',
  })
  topics: CommunityTopic[];

  @ManyToOne(() => Community, (c) => c.posts, {
    onDelete: 'CASCADE',
  })
  community: Community;

  @ManyToOne(() => CommunityGroup, (c) => c.posts, {
    onDelete: 'CASCADE',
  })
  group: CommunityGroup;

  @OneToMany(() => Comments, (comments) => comments.post)
  comments: Comments[];

  @OneToMany(() => GroupPostComments, (group_comments) => group_comments.post)
  group_comments: GroupPostComments[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'remove_feedback', type: 'text', default: null })
  remove_feedback: string;

  @Column({ name: 'reason_of_rejection', type: 'text', default: null })
  reason_of_rejection: string;

  @Column({
    name: 'post_location',
    type: 'enum',
    enum: POST_LOCATION,
    default: null,
  })
  post_location: POST_LOCATION;

  @Column({
    name: 'post_status',
    type: 'enum',
    enum: POST_STATUS,
    default: null,
  })
  post_status: POST_STATUS;

  @Column({
    name: 'post_share_type',
    type: 'enum',
    enum: POST_SHARE_TYPE,
    default: null,
  })
  post_share_type: POST_SHARE_TYPE;

  @Column({
    name: 'is_shared',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  is_share: TRUE_FALSE;

  @Column({ name: 'share_id', type: 'int', default: null })
  share_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
