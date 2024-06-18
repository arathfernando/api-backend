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
import { CourseLesson } from './course-lesson.entity';
import { LessonActivity } from './lesson-activity.entity';
import { StudentQuiz } from './student-quiz.entity';
import { TeacherQuizQuestion } from './quiz-question.entity';

@Entity('teacher_quiz')
export class TeacherQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(
    () => CourseLesson,
    (course_lesson) => course_lesson.teacher_quiz,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'lesson_id',
    referencedColumnName: 'id',
  })
  course_lesson: CourseLesson;

  @ManyToOne(
    () => LessonActivity,
    (lesson_activity) => lesson_activity.teacher_quiz,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'lesson_activity_id',
    referencedColumnName: 'id',
  })
  lesson_activity: LessonActivity;

  @OneToMany(() => StudentQuiz, (student_quiz) => student_quiz.teacher_quiz)
  @JoinColumn({ name: 'student_quiz', referencedColumnName: 'id' })
  student_quiz: StudentQuiz;

  @OneToMany(
    () => TeacherQuizQuestion,
    (quiz_question) => quiz_question.teacher_quiz,
  )
  @JoinColumn({ name: 'quiz_question', referencedColumnName: 'id' })
  quiz_question: TeacherQuizQuestion;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
