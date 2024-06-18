import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityPoll } from './polls.entity';
import { CommunityPollOptions } from './poll-option.entity';

@Entity('poll_answers')
export class CommunityPollAnswers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityPollOptions, (cp) => cp.answers, {
    onDelete: 'CASCADE',
  })
  option: CommunityPollOptions;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @ManyToOne(() => CommunityPoll, (cp) => cp.answers, {
    onDelete: 'CASCADE',
  })
  poll: CommunityPoll;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
