import {
  COMMUNITY_STATUS,
  COMMUNITY_TYPE,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityUser } from './community-users.entity';
import { CommunityPost } from './posts.entity';
import { CommunityReport } from './community-report.entity';
import { CommunityArticle } from './community-article.entity';
import { CommunityPoll } from './polls.entity';
import { CommunityLocationPost } from './location-post.entity';
import { CommunityRequest } from './community-request.entity';

@Entity('community')
export class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: false,
  })
  country: number;

  @Column({
    nullable: false,
  })
  state: string;

  @Column({
    nullable: false,
  })
  city: string;

  @Column({
    nullable: true,
  })
  district: string;

  @Column({
    nullable: true,
  })
  latitude: string;

  @Column({
    nullable: true,
  })
  longitude: string;

  @Column({
    nullable: true,
  })
  place_id: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    nullable: true,
  })
  language: number;

  @Column({ name: 'hbb_points', type: 'int', default: null })
  hbb_points: number;

  @Column({ name: 'hbs_points', type: 'int', default: null })
  hbs_points: number;

  @Column({ name: 'currency', type: 'int', default: null })
  currency: number;

  @Column({
    name: 'is_global',
    type: 'enum',
    enum: TRUE_FALSE,
    default: null,
  })
  is_global: TRUE_FALSE;

  @Column({
    nullable: true,
  })
  tag_line: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    name: 'is_published',
    type: 'enum',
    enum: TRUE_FALSE,
    default: null,
  })
  is_published: TRUE_FALSE;

  @Column({
    nullable: true,
  })
  invitation_code: string;

  @Column({
    name: 'community_type',
    type: 'enum',
    enum: COMMUNITY_TYPE,
    default: null,
  })
  community_type: COMMUNITY_TYPE;

  @OneToMany(() => CommunityUser, (cu) => cu.community)
  community_users: CommunityUser[];

  @OneToMany(() => CommunityRequest, (cu) => cu.community)
  community_request: CommunityRequest[];

  @OneToMany(() => CommunityPost, (cp) => cp.community)
  posts: CommunityPost[];

  @OneToMany(() => CommunityArticle, (cp) => cp.community)
  articles: CommunityArticle[];

  @OneToMany(() => CommunityPoll, (cp) => cp.community)
  polls: CommunityPoll[];

  @OneToMany(() => CommunityLocationPost, (cp) => cp.community)
  location_post: CommunityLocationPost[];

  @OneToMany(() => CommunityReport, (cp) => cp.community)
  community_reports: CommunityReport[];

  @Column({ default: null })
  community_created_by: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: COMMUNITY_STATUS,
    default: null,
  })
  status: COMMUNITY_STATUS;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
