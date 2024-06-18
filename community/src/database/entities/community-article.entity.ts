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

@Entity('community_article')
export class CommunityArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'content', type: 'text', default: null })
  content: string;

  @ManyToMany(() => CommunityTopic, (ct) => ct.community_articles, {
    onDelete: 'CASCADE',
  })
  topics: CommunityTopic[];

  @ManyToOne(() => Community, (c) => c.posts, {
    onDelete: 'CASCADE',
  })
  community: Community;

  @ManyToOne(() => CommunityGroup, (c) => c.articles, {
    onDelete: 'CASCADE',
  })
  group: CommunityGroup;

  @OneToMany(() => Comments, (comments) => comments.article)
  comments: Comments[];

  @OneToMany(() => GroupPostComments, (comments) => comments.article)
  group_comments: GroupPostComments[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'article_location',
    type: 'enum',
    enum: POST_LOCATION,
    default: null,
  })
  article_location: POST_LOCATION;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
