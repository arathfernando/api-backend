import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestContestant } from './contest-contestant.entity';
import { ContestOwnCriteriaSubmission } from './contest-own-criteria-submissions.entity';
import { ContestSubmission } from './contest-submissions.entity';
import { Contest } from './contest.entity';

@Entity('contest_submission_review')
export class ContestSubmissionReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'remark', type: 'text', default: null })
  remark: string;

  @Column({ name: 'rating', type: 'varchar', default: null })
  rating: number;

  @Column({ name: 'content', type: 'text', default: null, array: true })
  content: string[];

  @ManyToOne(() => Contest, (c) => c.contestant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_id',
    referencedColumnName: 'id',
  })
  contest: Contest;

  @ManyToOne(
    () => ContestOwnCriteriaSubmission,
    (c) => c.contest_submission_review,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'contest_own_criteria_submission_id',
    referencedColumnName: 'id',
  })
  contest_own_criteria_submission: ContestOwnCriteriaSubmission;

  @ManyToOne(() => ContestContestant, (cc) => cc.contest_submission, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_judge_id',
    referencedColumnName: 'id',
  })
  judge: ContestContestant;

  @ManyToOne(() => ContestSubmission, (cc) => cc.submission_review, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_submission_id',
    referencedColumnName: 'id',
  })
  contest_submission: ContestSubmission;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
