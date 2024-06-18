import { POLL_STATUS, POST_LOCATION } from 'src/core/constant/enum.constant';
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
import { CommunityPollAnswers } from './poll-answers.entity';
import { CommunityPollOptions } from './poll-option.entity';

@Entity('community_polls')
export class CommunityPoll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'question', type: 'text', default: null })
  question: string;

  @OneToMany(() => CommunityPollOptions, (cpq) => cpq.poll)
  options: CommunityPollOptions[];

  @OneToMany(() => CommunityPollAnswers, (cpa) => cpa.poll)
  answers: CommunityPollAnswers[];

  @ManyToMany(() => CommunityTopic, (ct) => ct.poll_posts, {
    onDelete: 'CASCADE',
  })
  topics: CommunityTopic[];

  @ManyToOne(() => Community, (c) => c.posts, {
    onDelete: 'CASCADE',
  })
  community: Community;

  @ManyToOne(() => CommunityGroup, (c) => c.polls, {
    onDelete: 'CASCADE',
  })
  group: CommunityGroup;

  @OneToMany(() => Comments, (comments) => comments.poll)
  comments: Comments[];

  @OneToMany(() => GroupPostComments, (comments) => comments.poll)
  group_comments: GroupPostComments[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'poll_location',
    type: 'enum',
    enum: POST_LOCATION,
    default: null,
  })
  poll_location: POST_LOCATION;

  @Column({
    name: 'poll_status',
    type: 'enum',
    enum: POLL_STATUS,
    default: null,
  })
  poll_status: POLL_STATUS;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
