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
import { CommunityLocationPost } from './location-post.entity';
import { CommunityPoll } from './polls.entity';
import { CommunityPost } from './posts.entity';
import { CommunityTimeline } from './timeline.entity';
import { PostCommentLike } from './post-comment-like.entity';
import { PostCommentReport } from './posts-comment-report.entity';
import { PostCommentHide } from './post-comment-hide.entity';

@Entity('post_comments')
export class Comments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_comment', type: 'varchar', default: null })
  parent_comment: number;

  @Column({ name: 'comment', type: 'varchar', default: null })
  comment: string;

  @Column({ name: 'like_count', type: 'varchar', default: null })
  like_count: number;

  @ManyToOne(() => Comments, (comment) => comment.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comments;

  @OneToMany(() => Comments, (comment) => comment.parent)
  children: Comments[];

  @OneToMany(() => PostCommentLike, (cl) => cl.comments)
  comment_likes: PostCommentLike[];

  @OneToMany(() => PostCommentHide, (cl) => cl.comments)
  comment_hide: PostCommentHide[];

  @OneToMany(() => PostCommentReport, (cl) => cl.comments)
  comment_report: PostCommentReport[];

  @ManyToOne(() => CommunityTimeline, (ct) => ct.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeline_id' })
  timeline_post: CommunityTimeline;

  @ManyToOne(() => CommunityPost, (c) => c.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: CommunityPost;

  @ManyToOne(() => CommunityPoll, (c) => c.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poll_id' })
  poll: CommunityPoll;

  @ManyToOne(() => CommunityLocationPost, (c) => c.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'share_location_id' })
  share_location: CommunityLocationPost;

  @ManyToOne(() => CommunityArticle, (c) => c.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
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
