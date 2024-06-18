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
import { ContestContestant } from './contest-contestant.entity';
import { Contest } from './contest.entity';
import { CONTEST_SUBMISSION_STATUS } from 'src/core/constant/enum.constant';
import { ContestSubmissionReview } from './contest-submission-review.entity';
import { ContestOwnCriteriaSubmission } from './contest-own-criteria-submissions.entity';
import { ContestSubmissionUpload } from './contest-submissions-upload.entity';

@Entity('contest_submission')
export class ContestSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'describe_entry', type: 'text', default: null })
  describe_entry: string;

  @Column({
    name: 'submission_status',
    type: 'enum',
    enum: CONTEST_SUBMISSION_STATUS,
    default: CONTEST_SUBMISSION_STATUS.UNDER_REVIEW,
  })
  submission_status: CONTEST_SUBMISSION_STATUS;

  @ManyToOne(() => Contest, (c) => c.contest_submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_id',
    referencedColumnName: 'id',
  })
  contest: Contest;

  @OneToMany(
    () => ContestOwnCriteriaSubmission,
    (cp) => cp.contest_submission,
    {
      onDelete: 'CASCADE',
    },
  )
  contestant_own_criteria_submission: ContestOwnCriteriaSubmission[];

  @OneToMany(() => ContestSubmissionUpload, (cp) => cp.contest_submission, {
    onDelete: 'CASCADE',
  })
  contestant_submission_upload: ContestSubmissionUpload[];

  @ManyToOne(() => ContestContestant, (c) => c.contest_submission, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_contestant_id',
    referencedColumnName: 'id',
  })
  contestant: ContestContestant;

  @OneToMany(() => ContestSubmissionReview, (cc) => cc.contest_submission, {})
  submission_review: ContestSubmissionReview;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
