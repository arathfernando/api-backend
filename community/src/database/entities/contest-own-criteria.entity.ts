import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestCriteria } from './contest-criteria.entity';
import { ContestOwnCriteriaSubmission } from './contest-own-criteria-submissions.entity';
import { ContestTemplates } from './contest-template.entity';

@Entity('contest_own_criteria')
export class ContestOwnCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'weightage', type: 'varchar', default: null })
  weightage: number;

  @OneToMany(
    () => ContestOwnCriteriaSubmission,
    (cp) => cp.contest_own_criteria,
    {
      onDelete: 'CASCADE',
    },
  )
  contestant_own_criteria_submission: ContestOwnCriteriaSubmission[];

  @ManyToOne(() => ContestCriteria, (c) => c.contest_own_criteria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'criteria_id',
  })
  contest_criteria: ContestCriteria;

  @ManyToOne(() => ContestTemplates, (c) => c.contest_own_criteria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'template_id',
  })
  contest_template: ContestTemplates;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
