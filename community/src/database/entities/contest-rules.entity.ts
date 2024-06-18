import { CONTEST_RULES } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contest } from './contest.entity';

@Entity('contest_rules')
export class ContestRules {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'contest_rules',
    type: 'enum',
    enum: CONTEST_RULES,
    default: null,
  })
  contest_rules: CONTEST_RULES;

  @Column({ name: 'other_description', type: 'varchar', default: null })
  other_description: string;

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @OneToOne(() => Contest, (contest) => contest.contest_rules, {
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
