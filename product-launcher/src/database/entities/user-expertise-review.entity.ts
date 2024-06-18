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
import { JobProposal } from './job-proposal.entity';
import { UserExpertiseReviewReaction } from './user-expertise-review-reaction.entity';
import { UserExpertiseReviewReply } from './user-expertise-review-reply.entity';

@Entity('user_expertise_review')
export class UserExpertiseReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'comment', type: 'text', default: null })
  comment: string;

  @Column({ name: 'expertise_content', type: 'int', default: null })
  expertise_content: number;

  @Column({ name: 'delivery', type: 'int', default: null })
  delivery: number;

  @Column({ name: 'results', type: 'int', default: null })
  results: number;

  @Column({ name: 'over_all_rating', type: 'int', default: null })
  over_all_rating: number;

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'expertise_user_id', type: 'int', default: null })
  expertise_user_id: number;

  @ManyToOne(() => JobProposal, (pg) => pg.user_expertise_review, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'job_proposal_id',
    referencedColumnName: 'id',
  })
  job_proposal: JobProposal;

  @OneToMany(
    () => UserExpertiseReviewReaction,
    (pgf) => pgf.user_expertise_review,
  )
  user_expertise_review_reaction: UserExpertiseReviewReaction[];

  @OneToMany(() => UserExpertiseReviewReply, (pgf) => pgf.user_expertise_review)
  user_expertise_review_reply: UserExpertiseReviewReply[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
