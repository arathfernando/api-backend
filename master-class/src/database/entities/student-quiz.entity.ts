import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TeacherQuiz } from './teacher-quiz.entity';
import { TeacherQuizQuestion } from './quiz-question.entity';

@Entity('student_quiz')
export class StudentQuiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'answers', type: 'text', default: null, array: true })
  answers: string[];

  @ManyToOne(() => TeacherQuiz, (teacher_quiz) => teacher_quiz.student_quiz, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'teacher_quiz_id',
    referencedColumnName: 'id',
  })
  teacher_quiz: TeacherQuiz;

  @ManyToOne(() => TeacherQuizQuestion, (tq) => tq.student_quiz, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'quiz_question_id',
    referencedColumnName: 'id',
  })
  quiz_question: TeacherQuizQuestion;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
