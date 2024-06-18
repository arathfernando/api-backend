import { TRUE_FALSE } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeneralProfile } from './';

@Entity('work_experience', { orderBy: { id: 'ASC' } })
export class WorkExperience {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'company_name', type: 'varchar', default: null })
  company_name: string;

  @Column({ name: 'job_title', type: 'varchar', default: null })
  job_title: string;

  @Column({ name: 'start_date', type: 'varchar', default: null })
  start_date: string;

  @Column({ name: 'end_date', type: 'varchar', default: null })
  end_date: string;

  @Column({
    name: 'currently_working',
    type: 'enum',
    enum: TRUE_FALSE,
    default: null,
  })
  currently_working: TRUE_FALSE;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @ManyToOne(
    () => GeneralProfile,
    (general_profile) => general_profile.work_experience,
    {
      onDelete: 'CASCADE',
    },
  )
  general_profile: GeneralProfile;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
