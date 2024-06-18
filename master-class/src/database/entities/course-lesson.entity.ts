import { COURSE_ACCESS_TYPE } from 'src/core/constant/enum.constant';
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
import { CourseBasic } from './course-basic.entity';
import { CourseChapter } from './course-chapter.entity';
import { LessonActivity } from './lesson-activity.entity';
import { TeacherQuiz } from './teacher-quiz.entity';
import { TeacherFileAssignment } from './teacher-file-assignment.entity';

@Entity('course_lesson')
export class CourseLesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'course_access_type',
    type: 'enum',
    enum: COURSE_ACCESS_TYPE,
    default: COURSE_ACCESS_TYPE.FREE,
  })
  course_access_type: COURSE_ACCESS_TYPE;

  @Column({ name: 'lesson_title', type: 'text', default: null })
  lesson_title: string;

  @Column({ name: 'lesson_description', type: 'text', default: null })
  lesson_description: string;

  @Column({ name: 'media', type: 'text', default: null })
  media: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'date', type: 'varchar', default: null })
  date: string;

  @ManyToOne(
    () => CourseChapter,
    (course_chapter) => course_chapter.course_lesson,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'chapter_id',
    referencedColumnName: 'id',
  })
  course_chapter: CourseChapter;

  @OneToMany(
    () => LessonActivity,
    (lesson_activity) => lesson_activity.course_lesson,
  )
  @JoinColumn({ name: 'lesson_activity', referencedColumnName: 'id' })
  lesson_activity: LessonActivity;

  @OneToMany(() => TeacherQuiz, (teacher_quiz) => teacher_quiz.course_lesson)
  @JoinColumn({ name: 'teacher_quiz', referencedColumnName: 'id' })
  teacher_quiz: TeacherQuiz;

  @ManyToOne(() => CourseBasic, (course_basic) => course_basic.instructors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
  })
  course_basic: CourseBasic;

  @OneToMany(() => TeacherFileAssignment, (tfa) => tfa.course_lesson)
  teacher_file_assignment: TeacherFileAssignment[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
