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
import { StudentFileAssignment } from './student-file-assignment.entity';
import { CourseLesson } from './course-lesson.entity';
import { LessonActivity } from './lesson-activity.entity';

@Entity('teacher_file_assignment')
export class TeacherFileAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'maximum_no_of_file',
    type: 'varchar',
    default: null,
  })
  maximum_no_of_file: number;

  @Column({ name: 'add_file', type: 'text', default: null, array: true })
  add_file: string[];

  @OneToMany(
    () => StudentFileAssignment,
    (lang) => lang.teacher_file_assignment,
  )
  student_file_assignment: StudentFileAssignment[];

  @Column({ name: 'date_due', type: 'text', default: null })
  date_due: string;

  @Column({ name: 'time_due', type: 'text', default: null })
  time_due: string;

  @ManyToOne(() => CourseLesson, (cl) => cl.teacher_file_assignment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_lesson_id',
    referencedColumnName: 'id',
  })
  course_lesson: CourseLesson;

  @ManyToOne(() => LessonActivity, (la) => la.teacher_file_assignment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'lesson_activity_id',
    referencedColumnName: 'id',
  })
  lesson_activity: LessonActivity;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
