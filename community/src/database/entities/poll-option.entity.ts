import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityPoll } from './polls.entity';
import { CommunityPollAnswers } from './poll-answers.entity';

@Entity('poll_options')
export class CommunityPollOptions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'option', type: 'varchar', default: null })
  option: string;

  @ManyToOne(() => CommunityPoll, (cp) => cp.options, {
    onDelete: 'CASCADE',
  })
  poll: CommunityPoll;

  @OneToMany(() => CommunityPollAnswers, (so) => so.option)
  answers: CommunityPollAnswers[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
