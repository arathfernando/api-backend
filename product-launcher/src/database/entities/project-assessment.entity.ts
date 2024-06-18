import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectBasic } from './project-basic.entity';

@Entity('project_assessment')
export class ProjectAssessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_category', type: 'int', default: null })
  product_category: number;

  @Column({ name: 'product_sub_category', type: 'int', default: null })
  product_sub_category: number;

  @Column({ name: 'product_sub_faq', type: 'int', default: null })
  product_sub_faq: number;

  @Column({ name: 'product_sub_faq_ans', type: 'text', default: null })
  product_sub_faq_ans: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(
    () => ProjectBasic,
    (projectBasic) => projectBasic.project_assessment,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
  })
  project_basic: ProjectBasic;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
