import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityArticle } from './community-article.entity';
import { CommunityGroupTimeline } from './group-timeline.entity';
import { CommunityLocationPost } from './location-post.entity';
import { CommunityPoll } from './polls.entity';
import { CommunityPost } from './posts.entity';
import { GroupPostCommentLike } from './post-group-comment-like.entity';
import { GroupPostCommentHide } from './post-group-comment-hide.entity';

@Entity('group_post_comments')
export class GroupPostComments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_comment', type: 'varchar', default: null })
  parent_comment: number;

  @Column({ name: 'comment', type: 'varchar', default: null })
  comment: string;

  @Column({ name: 'like_count', type: 'varchar', default: null })
  like_count: number;

  @OneToMany(() => GroupPostCommentLike, (gcl) => gcl.comments)
  group_comment_likes: GroupPostCommentLike[];

  @OneToMany(() => GroupPostCommentHide, (gcl) => gcl.comments)
  group_comment_hide: GroupPostCommentHide[];

  @ManyToOne(() => GroupPostComments, (comment) => comment.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: GroupPostComments;

  @OneToMany(() => GroupPostComments, (comment) => comment.parent)
  children: GroupPostComments[];

  @ManyToOne(() => CommunityGroupTimeline, (ct) => ct.group_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_timeline_id' })
  group_timeline_post: CommunityGroupTimeline;

  @ManyToOne(() => CommunityPost, (c) => c.group_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_post_id' })
  post: CommunityPost;

  @ManyToOne(() => CommunityPoll, (c) => c.group_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_poll_id' })
  poll: CommunityPoll;

  @ManyToOne(() => CommunityLocationPost, (c) => c.group_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_share_location_id' })
  share_location: CommunityLocationPost;

  @ManyToOne(() => CommunityArticle, (c) => c.group_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_article_id' })
  article: CommunityArticle;

  @Column({ name: 'commented_by', type: 'varchar', default: null })
  commented_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
