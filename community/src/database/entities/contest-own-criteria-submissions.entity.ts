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
import { Contest } from './contest.entity';
import { ContestOwnCriteria } from './contest-own-criteria.entity';
import { ContestSubmission } from './contest-submissions.entity';
import { ContestSubmissionReview } from './contest-submission-review.entity';

@Entity('contest_own_criteria_submission')
export class ContestOwnCriteriaSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => ContestOwnCriteria,
    (c) => c.contestant_own_criteria_submission,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'contest_own_criteria_id',
    referencedColumnName: 'id',
  })
  contest_own_criteria: ContestOwnCriteria;

  @OneToMany(
    () => ContestSubmissionReview,
    (cp) => cp.contest_own_criteria_submission,
    {
      onDelete: 'CASCADE',
    },
  )
  contest_submission_review: ContestSubmissionReview[];

  @ManyToOne(
    () => ContestSubmission,
    (c) => c.contestant_own_criteria_submission,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'contest_submission_id',
    referencedColumnName: 'id',
  })
  contest_submission: ContestSubmission;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @ManyToOne(() => Contest, (c) => c.contestant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_id',
    referencedColumnName: 'id',
  })
  contest: Contest;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
