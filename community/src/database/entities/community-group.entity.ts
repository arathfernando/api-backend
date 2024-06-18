import {
  GROUP_PRIVACY,
  GROUP_STATUS,
  GROUP_TYPE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityTopic } from './community-topic.entity';
import { GroupRule } from './group-rules.entity';
import { GroupUsers } from './group-users.entity';
import { GroupReport } from './group-report.entity';
import { CommunityPost } from './posts.entity';
import { CommunityArticle } from './community-article.entity';
import { CommunityPoll } from './polls.entity';
import { CommunityLocationPost } from './location-post.entity';
import { GroupActivity } from './group-activity.entity';

@Entity('community_group')
export class CommunityGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_name', type: 'varchar', default: null })
  group_name: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @Column({
    name: 'group_type',
    type: 'enum',
    enum: GROUP_TYPE,
    default: null,
  })
  group_type: GROUP_TYPE;

  @Column({
    name: 'privacy',
    type: 'enum',
    enum: GROUP_PRIVACY,
    default: null,
  })
  privacy: GROUP_PRIVACY;

  @Column({ name: 'cover_page', type: 'varchar', default: null })
  cover_page: string;

  @OneToMany(() => GroupRule, (gr) => gr.community_group)
  group_rules: GroupRule[];

  @OneToMany(() => GroupUsers, (gu) => gu.group)
  group_users: GroupUsers[];

  @OneToMany(() => GroupReport, (cp) => cp.group)
  group_reports: GroupReport[];

  @OneToMany(() => GroupActivity, (cp) => cp.group)
  group_activity: GroupActivity[];

  @Column({
    nullable: true,
  })
  invitation_code: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: GROUP_STATUS,
    default: null,
  })
  status: GROUP_STATUS;

  @OneToMany(() => CommunityTopic, (cp) => cp.group)
  topics: CommunityTopic[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @OneToMany(() => CommunityPost, (cp) => cp.group)
  posts: CommunityPost[];

  @OneToMany(() => CommunityArticle, (cp) => cp.group)
  articles: CommunityArticle[];

  @OneToMany(() => CommunityPoll, (cp) => cp.group)
  polls: CommunityPoll[];

  @OneToMany(() => CommunityLocationPost, (cp) => cp.group)
  location_post: CommunityLocationPost[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
