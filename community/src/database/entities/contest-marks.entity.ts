import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestCriteria } from './contest-criteria.entity';
import { ContestTemplates } from './contest-template.entity';

@Entity('contest_marks')
export class ContestMarks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @Column({ name: 'mark', type: 'int', default: null })
  mark: number;

  @ManyToOne(() => ContestCriteria, (c) => c.contest_marks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'criteria_id',
  })
  contest_criteria: ContestCriteria;

  @ManyToOne(() => ContestTemplates, (c) => c.contest_marks, {
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
