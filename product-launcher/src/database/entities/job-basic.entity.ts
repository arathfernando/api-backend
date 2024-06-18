import { JOB_STATUS } from 'src/core/constant/enum.constant';
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
import { JobProposal } from './job-proposal.entity';
import { JobReaction } from './job-reaction.entity';
import { ProjectBasic } from './project-basic.entity';
import { JobFiles } from './job-files.entity';

@Entity('job_basic')
export class JobBasic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'job_name', type: 'varchar', default: null })
  job_name: string;

  @Column({ name: 'job_description', type: 'text', default: null })
  job_description: string;

  @Column({ name: 'price', type: 'int', default: null })
  price: number;

  @Column({ name: 'skills', type: 'int', default: null, array: true })
  skills: number[];

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @Column({ name: 'end_date', type: 'text', default: null })
  end_date: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: JOB_STATUS,
    default: null,
  })
  status: JOB_STATUS;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @OneToMany(() => JobProposal, (pgf) => pgf.job_basic)
  job_proposal: JobProposal[];

  @OneToMany(() => JobFiles, (pgf) => pgf.job)
  job_files: JobFiles;

  @OneToMany(() => JobReaction, (pgf) => pgf.job_basic)
  job_reaction: JobReaction[];

  @ManyToOne(() => ProjectBasic, (pg) => pg.job_basic, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'project_id',
    referencedColumnName: 'id',
  })
  project: ProjectBasic;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
