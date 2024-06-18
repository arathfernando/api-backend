import { POST_LOCATION } from 'src/core/constant/enum.constant';
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

@Entity('community_location_post')
export class CommunityLocationPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'content', type: 'text', default: null })
  content: string;

  @Column({ name: 'location', type: 'text', default: null })
  location: string;

  @ManyToMany(() => CommunityTopic, (ct) => ct.location_post, {
    onDelete: 'CASCADE',
  })
  topics: CommunityTopic[];

  @ManyToOne(() => Community, (c) => c.posts, {
    onDelete: 'CASCADE',
  })
  community: Community;

  @ManyToOne(() => CommunityGroup, (c) => c.location_post, {
    onDelete: 'CASCADE',
  })
  group: CommunityGroup;

  @OneToMany(() => Comments, (comments) => comments.share_location)
  comments: Comments[];

  @OneToMany(() => GroupPostComments, (comments) => comments.poll)
  group_comments: GroupPostComments[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'post_location',
    type: 'enum',
    enum: POST_LOCATION,
    default: null,
  })
  post_location: POST_LOCATION;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
