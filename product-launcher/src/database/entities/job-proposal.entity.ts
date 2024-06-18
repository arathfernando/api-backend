import {
  PROPOSAL_JOB_STATUS,
  PROPOSAL_RATE_TYPE,
  PROPOSAL_STATUS,
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
import { JobBasic } from './job-basic.entity';
import { UserExpertiseReview } from './user-expertise-review.entity';
import { JobProposalReply } from './job-proposal-reply.entity';
import { JobProposalPayment } from './job-proposal-payment.entity';
import { JobProposalBillingSettings } from './job-proposal-billing-setting.entity';

@Entity('job_proposal')
export class JobProposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'job_description', type: 'text', default: null })
  bid_description: string;

  @Column({ name: 'price', type: 'int', default: null })
  rate: number;

  @Column({ name: 'skills', type: 'int', default: null, array: true })
  skills: number[];

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @Column({ name: 'end_date', type: 'text', default: null })
  delivery_date: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PROPOSAL_STATUS,
    default: null,
  })
  status: PROPOSAL_STATUS;

  @Column({
    name: 'proposal_job_status',
    type: 'enum',
    enum: PROPOSAL_JOB_STATUS,
    default: null,
  })
  proposal_job_status: PROPOSAL_JOB_STATUS;

  @Column({
    name: 'rate_type',
    type: 'enum',
    enum: PROPOSAL_RATE_TYPE,
    default: null,
  })
  rate_type: PROPOSAL_RATE_TYPE;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(() => JobBasic, (pg) => pg.job_proposal, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'job_basic_id',
    referencedColumnName: 'id',
  })
  job_basic: JobBasic;

  @OneToMany(() => UserExpertiseReview, (pgf) => pgf.job_proposal)
  user_expertise_review: UserExpertiseReview[];

  @OneToMany(() => JobProposalPayment, (pgf) => pgf.job_proposal)
  job_proposal_payment: JobProposalPayment[];

  @OneToMany(() => JobProposalBillingSettings, (pgf) => pgf.job_proposal)
  job_proposal_billing_setting: JobProposalBillingSettings[];

  @OneToMany(() => JobProposalReply, (pgf) => pgf.job_proposal)
  job_proposal_reply: JobProposalReply[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
