import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contest } from './contest.entity';
import { ContestSubmission } from './contest-submissions.entity';

@Entity('contest_own_criteria_submission_upload')
export class ContestSubmissionUpload {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ name: 'name', type: 'text', default: null })
  name: string;

  @Column({ name: 'file_url', type: 'text', default: null })
  file_url: string;

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
