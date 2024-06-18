import { FILE_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { LessonActivityComment } from './lesson-activity-comment.entity';
import { CourseLesson } from './course-lesson.entity';
import { LessonActivityMark } from './lesson-activity-mark.entity';
import { TeacherQuiz } from './teacher-quiz.entity';
import { TeacherFileAssignment } from './teacher-file-assignment.entity';

@Entity('lesson_activity')
export class LessonActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'file_type',
    type: 'enum',
    enum: FILE_TYPE,
    default: null,
  })
  file_type: FILE_TYPE;

  @ManyToOne(
    () => CourseLesson,
    (course_lesson) => course_lesson.lesson_activity,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'lesson_id',
    referencedColumnName: 'id',
  })
  course_lesson: CourseLesson;

  @OneToMany(
    () => LessonActivityComment,
    (lessonActivityComment) => lessonActivityComment.lesson_activity,
  )
  @JoinColumn({ name: 'lesson_activity_comment', referencedColumnName: 'id' })
  lesson_activity_comment: LessonActivityComment[];

  @OneToMany(
    () => LessonActivityMark,
    (LessonActivityMark) => LessonActivityMark.lesson_activity,
  )
  @JoinColumn({ name: 'lesson_activity_mark_id', referencedColumnName: 'id' })
  lesson_activity_mark: LessonActivityMark[];

  @OneToMany(() => TeacherQuiz, (teacher_quiz) => teacher_quiz.lesson_activity)
  @JoinColumn({ name: 'teacher_quiz', referencedColumnName: 'id' })
  teacher_quiz: TeacherQuiz;

  @OneToMany(() => TeacherFileAssignment, (tfa) => tfa.lesson_activity)
  @JoinColumn({ name: 'teacher_file_assignment', referencedColumnName: 'id' })
  teacher_file_assignment: TeacherFileAssignment;

  @Column({ name: 'file_name', type: 'text', default: null })
  file_name: string;

  @Column({ name: 'file_description', type: 'text', default: null })
  file_description: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    nullable: true,
  })
  file_url: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
