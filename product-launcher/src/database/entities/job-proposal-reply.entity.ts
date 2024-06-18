import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobProposal } from './job-proposal.entity';

@Entity('job_proposal_reply')
export class JobProposalReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(() => JobProposal, (pg) => pg.job_proposal_reply, {
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
