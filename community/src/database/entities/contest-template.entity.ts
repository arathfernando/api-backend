import { YES_NO, CONTEST_RULES } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestMarks } from './contest-marks.entity';
import { ContestOwnCriteria } from './contest-own-criteria.entity';
import { ContestPrize } from './contest-prize.entity';

@Entity('contest_templates')
export class ContestTemplates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_name', type: 'varchar', default: null })
  template_name: string;

  @Column({ name: 'template_category', type: 'varchar', default: null })
  template_category: string;

  @Column({ name: 'contest_description', type: 'varchar', default: null })
  contest_description: string;

  @OneToMany(() => ContestPrize, (cp) => cp.contest_template)
  contest_prizes: ContestPrize[];

  @OneToMany(() => ContestOwnCriteria, (cp) => cp.contest_template)
  contest_own_criteria: ContestOwnCriteria[];

  @Column({
    name: 'own_criteria',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  own_criteria: YES_NO;

  @OneToMany(() => ContestMarks, (cm) => cm.contest_template)
  contest_marks: ContestMarks[];

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

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
