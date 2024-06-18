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

@Entity('course_faq')
export class CourseFaq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'question', type: 'varchar', default: null })
  question: string;

  @Column({ name: 'answer', type: 'varchar', default: null })
  answer: string;

  @ManyToOne(() => CourseBasic, (course_basic) => course_basic.course_faq, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
  })
  course_basic: CourseBasic;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
