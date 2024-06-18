import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserExpertiseProposal } from './user-expertise-proposal.entity';

@Entity('user_expertise_proposal_reply')
export class UserExpertiseProposalReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(
    () => UserExpertiseProposal,
    (pg) => pg.user_expertise_proposal_reply,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_expertise_proposal_id',
    referencedColumnName: 'id',
  })
  user_expertise_proposal: UserExpertiseProposal;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
