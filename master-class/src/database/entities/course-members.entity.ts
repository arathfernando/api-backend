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

@Entity('course_members')
export class CourseMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CourseBasic, (course_basic) => course_basic.instructors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
  })
  course_basic: CourseBasic;

  @Column({ name: 'user_id', type: 'int', default: null })
  user_id: number;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
