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

@Entity('contest_reaction')
export class ContestReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @Column({ name: 'reaction', type: 'text', default: null })
  reaction: string;

  @ManyToOne(() => Contest, (c) => c.reaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_id',
  })
  contest: Contest;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
