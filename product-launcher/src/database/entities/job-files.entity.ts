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
import { FILE_UPLOAD_BY } from 'src/core/constant/enum.constant';

@Entity('job_files')
export class JobFiles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'upload_to', type: 'varchar', default: null })
  upload_to: number;

  @Column({
    name: 'file_upload_by',
    type: 'enum',
    enum: FILE_UPLOAD_BY,
    default: null,
  })
  file_upload_by: FILE_UPLOAD_BY;

  @ManyToOne(() => JobBasic, (pg) => pg.job_files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'job_id',
    referencedColumnName: 'id',
  })
  job: JobBasic;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
