import {
  CONTESTANT_ROLE,
  CONTESTANT_STATUS,
} from 'src/core/constant/enum.constant';
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
import { ContestSubmissionReview } from './contest-submission-review.entity';
import { ContestSubmission } from './contest-submissions.entity';
import { Contest } from './contest.entity';

@Entity('contest_contestant')
export class ContestContestant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role',
    type: 'enum',
    enum: CONTESTANT_ROLE,
    default: null,
  })
  role: CONTESTANT_ROLE;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CONTESTANT_STATUS,
    default: CONTESTANT_STATUS.PENDING,
  })
  status: CONTESTANT_STATUS;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(() => Contest, (c) => c.contestant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_id',
  })
  contest: Contest;

  @OneToMany(() => ContestSubmission, (cs) => cs.contestant)
  contest_submission: ContestSubmission[];

  @OneToMany(() => ContestSubmissionReview, (cs) => cs.judge)
  submission_review: ContestSubmissionReview[];

  @Column()
  @CreateDateColumn()
  time_of_accepted: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
