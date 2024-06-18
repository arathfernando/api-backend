import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobBasic } from './job-basic.entity';

@Entity('job_reaction')
export class JobReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reaction', type: 'text', default: null })
  reaction: string;

  @ManyToOne(() => JobBasic, (pg) => pg.job_reaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'job_basic_id',
    referencedColumnName: 'id',
  })
  job_basic: JobBasic;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
