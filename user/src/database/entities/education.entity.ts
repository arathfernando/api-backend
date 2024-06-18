import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeneralProfile } from './';

@Entity('education', { orderBy: { id: 'ASC' } })
export class Education {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'institute_name', type: 'varchar', default: null })
  institute_name: string;

  @Column({ name: 'degree', type: 'varchar', default: null })
  degree: string;

  @Column({ name: 'graduation_year', type: 'varchar', default: null })
  graduation_year: string;

  @ManyToOne(
    () => GeneralProfile,
    (general_profile) => general_profile.education,
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
