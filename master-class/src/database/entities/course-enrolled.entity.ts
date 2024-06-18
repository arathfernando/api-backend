import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseBasic } from './course-basic.entity';

@Entity('course_enrolled')
export class CourseEnrolled {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CourseBasic, (cb) => cb.course_enrolled, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'id' })
  course_basic: CourseBasic;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'user_id', type: 'int', default: null })
  user_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
