import { YES_NO } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestMarks } from './contest-marks.entity';
import { ContestOwnCriteria } from './contest-own-criteria.entity';
import { ContestPrize } from './contest-prize.entity';
import { Contest } from './contest.entity';

@Entity('contest_criteria')
export class ContestCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contest_description', type: 'varchar', default: null })
  contest_description: string;

  @OneToMany(() => ContestPrize, (cp) => cp.contest_criteria)
  contest_prizes: ContestPrize[];

  @Column({
    name: 'own_criteria',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  own_criteria: YES_NO;

  @OneToMany(() => ContestMarks, (cm) => cm.contest_criteria)
  contest_marks: ContestMarks[];

  @OneToMany(() => ContestOwnCriteria, (cm) => cm.contest_criteria)
  contest_own_criteria: ContestOwnCriteria[];

  @OneToOne(() => Contest, (contest) => contest.contest_criteria, {
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
