import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PROPOSAL_PAYMENT_TYPE } from 'src/core/constant/enum.constant';
import { JobProposal } from './job-proposal.entity';

@Entity('job_proposal_payment')
export class JobProposalPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'amount', type: 'int', default: null })
  amount: number;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PROPOSAL_PAYMENT_TYPE,
    default: null,
  })
  payment_type: PROPOSAL_PAYMENT_TYPE;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(() => JobProposal, (pg) => pg.job_proposal_payment, {
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
