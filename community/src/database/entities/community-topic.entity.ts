import {
  TOPIC_LOCATION,
  TOPIC_STATUS,
  TOPIC_TYPE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityArticle } from './community-article.entity';
import { CommunityGroup } from './community-group.entity';

import { TopicLike } from './community-topic-like.entity';
import { TopicFollow } from './community-topic-follow.entity';
import { CommunityLocationPost } from './location-post.entity';
import { CommunityPoll } from './polls.entity';
import { CommunityPost } from './posts.entity';
import { TopicReaction } from './topic-reaction.entity';

@Entity('community_topics')
export class CommunityTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    default: null,
  })
  display_name: string;

  @Column({
    nullable: false,
  })
  description: string;

  @Column({
    name: 'topic_location',
    type: 'enum',
    enum: TOPIC_LOCATION,
    default: null,
  })
  topic_location: TOPIC_LOCATION;

  @Column({
    name: 'topic_type',
    type: 'enum',
    enum: TOPIC_TYPE,
    default: null,
  })
  topic_type: TOPIC_TYPE;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TOPIC_STATUS,
    default: null,
  })
  status: TOPIC_STATUS;

  @OneToMany(() => TopicReaction, (tr) => tr.topic)
  topic_reactions: TopicReaction[];

  @OneToMany(() => TopicLike, (pl) => pl.community_topic)
  likes: TopicLike[];

  @OneToMany(() => TopicFollow, (pl) => pl.community_topic)
  follows: TopicFollow[];

  @ManyToOne(() => CommunityGroup, (c) => c.topics, {
    onDelete: 'CASCADE',
  })
  group: CommunityGroup;

  @ManyToMany(() => CommunityPost, (cp) => cp.topics, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'post_topics',
    joinColumn: { name: 'topic_id' },
    inverseJoinColumn: { name: 'post_id' },
  })
  posts: CommunityPost[];

  @ManyToMany(() => CommunityArticle, (cp) => cp.topics, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'article_topics',
    joinColumn: { name: 'topic_id' },
    inverseJoinColumn: { name: 'article_id' },
  })
  community_articles: CommunityArticle[];

  @ManyToMany(() => CommunityLocationPost, (cp) => cp.topics, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'location_post_topics',
    joinColumn: { name: 'topic_id' },
    inverseJoinColumn: { name: 'location_post_id' },
  })
  location_post: CommunityLocationPost[];

  @ManyToMany(() => CommunityPoll, (cp) => cp.topics, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'poll_post_topics',
    joinColumn: { name: 'topic_id' },
    inverseJoinColumn: { name: 'poll_id' },
  })
  poll_posts: CommunityPoll[];

  @Column({
    default: null,
  })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
