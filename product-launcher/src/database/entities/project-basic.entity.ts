import { LAUNCH_TYPE, PROJECT_STATUS } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectAssessment } from './project-assessment.entity';
import { ProjectMember } from './project-member.entity';
import { JobBasic } from './job-basic.entity';

@Entity('project_basic')
export class ProjectBasic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_title', type: 'varchar', default: null })
  project_name: string;

  @Column({ name: 'project_description', type: 'text', default: null })
  project_description: string;

  @Column({ name: 'project_market', type: 'text', default: null })
  project_market: string;

  @Column({ name: 'product_category', type: 'int', default: null })
  product_category: number;

  @Column({ name: 'price', type: 'int', default: null })
  price: number;

  @Column({ name: 'country', type: 'int', default: null })
  country: number;

  @Column({ name: 'language', type: 'int', default: null })
  language: number;

  @Column({ name: 'goals', type: 'int', default: null, array: true })
  goals: number[];

  @Column({
    name: 'innovation_category',
    type: 'int',
    default: null,
    array: true,
  })
  innovation_category: number[];

  @Column({ name: 'tech_category', type: 'int', default: null, array: true })
  tech_category: number[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: PROJECT_STATUS,
    default: null,
  })
  status: PROJECT_STATUS;

  @Column({
    name: 'launch_type',
    type: 'enum',
    enum: LAUNCH_TYPE,
    default: null,
  })
  launch_type: LAUNCH_TYPE;

  @Column({
    nullable: true,
  })
  project_image: string;

  @OneToMany(
    () => ProjectAssessment,
    (projectAssessment) => projectAssessment.project_basic,
  )
  @JoinColumn({ name: 'course_faq', referencedColumnName: 'id' })
  project_assessment: ProjectAssessment[];

  @OneToMany(
    () => ProjectMember,
    (projectAssessment) => projectAssessment.project_basic,
  )
  @JoinColumn({ name: 'course_faq', referencedColumnName: 'id' })
  project_member: ProjectMember[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @OneToMany(() => JobBasic, (pgf) => pgf.project)
  job_basic: JobBasic[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
