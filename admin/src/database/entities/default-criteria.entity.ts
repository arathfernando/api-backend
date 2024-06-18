import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import ContestCategory from './contest-category.entity';

@Entity('default_criteria', { orderBy: { id: 'ASC' } })
export default class DefaultCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContestCategory, (cc) => cc.default_criteria)
  @JoinColumn({
    name: 'contest_category_id',
  })
  contest_category: ContestCategory;

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'weightage', type: 'int', default: null })
  weightage: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
