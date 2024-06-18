import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import DefaultCriteria from './default-criteria.entity';

@Entity('contest_category', { orderBy: { id: 'ASC' } })
export default class ContestCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToMany(() => DefaultCriteria, (dc) => dc.contest_category)
  default_criteria: DefaultCriteria[];

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @Column({ name: 'prompts_text', type: 'varchar', default: null })
  prompts_text: string;

  @Column({ name: 'image', type: 'varchar', default: null })
  image: string;

  @Column({
    name: 'contest_standard_rule',
    type: 'varchar',
    default: null,
  })
  contest_standard_rule: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
