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

@Entity('instructors')
export class Instructors {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'instructor_id', type: 'int', default: null, array: true })
  instructor_id: number[];

  @ManyToOne(() => CourseBasic, (course_basic) => course_basic.instructors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
  })
  course_basic: CourseBasic;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @Column({ name: 'instructor_title', type: 'text', default: null })
  instructor_title: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
