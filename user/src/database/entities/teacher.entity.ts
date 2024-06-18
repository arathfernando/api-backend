import { EXP_TEACHER, YES_NO } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './';

@Entity('teacher_profile', { orderBy: { id: 'ASC' } })
export class TeacherProfile {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    name: 'experience_teacher',
    type: 'enum',
    enum: EXP_TEACHER,
    default: null,
  })
  experience_teacher: EXP_TEACHER;

  @Column({ name: 'language', type: 'simple-array', default: null })
  language: number[];

  @Column({
    name: 'have_geo_preference',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  have_geo_preference: YES_NO;

  @Column({ name: 'geo_preference', type: 'text', default: null })
  geo_preference: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'city', type: 'text', default: null })
  city: string;

  @OneToOne(() => User, (user) => user.teacher_profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
