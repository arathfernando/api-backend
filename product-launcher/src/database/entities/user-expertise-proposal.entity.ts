import {
  PROPOSAL_RATE_TYPE,
  PROPOSAL_STATUS,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserExpertiseProposalReply } from './user-expertise-proposal-reply.entity';

@Entity('user_expertise_proposal')
export class UserExpertiseProposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'job_description', type: 'text', default: null })
  bid_description: string;

  @Column({ name: 'project_name', type: 'text', default: null })
  project_name: string;

  @Column({ name: 'price', type: 'int', default: null })
  rate: number;

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: PROPOSAL_STATUS,
    default: null,
  })
  status: PROPOSAL_STATUS;

  @Column({
    name: 'rate_type',
    type: 'enum',
    enum: PROPOSAL_RATE_TYPE,
    default: null,
  })
  rate_type: PROPOSAL_RATE_TYPE;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @OneToMany(
    () => UserExpertiseProposalReply,
    (pgf) => pgf.user_expertise_proposal,
  )
  user_expertise_proposal_reply: UserExpertiseProposalReply[];

  @Column({ name: 'user_id', type: 'int', default: null })
  user_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
