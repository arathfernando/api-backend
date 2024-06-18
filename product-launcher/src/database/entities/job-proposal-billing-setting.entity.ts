import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  PROPOSAL_BILLING_FREQUENCY,
  PROPOSAL_PAYMENT_TYPE,
} from 'src/core/constant/enum.constant';
import { JobProposal } from './job-proposal.entity';

@Entity('job_proposal_billing_settings')
export class JobProposalBillingSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PROPOSAL_PAYMENT_TYPE,
    default: null,
  })
  payment_type: PROPOSAL_PAYMENT_TYPE;

  @Column({
    name: 'billing_frequency',
    type: 'enum',
    enum: PROPOSAL_BILLING_FREQUENCY,
    default: null,
  })
  billing_frequency: PROPOSAL_BILLING_FREQUENCY;

  @Column({ name: 'expertise_user_id', type: 'int', default: null })
  expertise_user_id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(() => JobProposal, (pg) => pg.job_proposal_billing_setting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'job_proposal_id',
    referencedColumnName: 'id',
  })
  job_proposal: JobProposal;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
