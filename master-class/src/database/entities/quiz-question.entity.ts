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
import { QUESTION_TYPE } from 'src/core/constant/enum.constant';
import { TeacherQuiz } from './teacher-quiz.entity';
import { StudentQuiz } from './student-quiz.entity';

@Entity('teacher_quiz_question')
export class TeacherQuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'question_name', type: 'varchar', default: null })
  question_name: string;

  @Column({ name: 'answers', type: 'text', default: null, array: true })
  answers: string[];

  @Column({ name: 'options', type: 'text', default: null, array: true })
  options: string[];

  @Column({
    name: 'question_description',
    type: 'text',
    default: null,
  })
  question_description: string;

  @Column({
    name: 'question_type',
    type: 'enum',
    default: null,
    enum: QUESTION_TYPE,
  })
  question_type: QUESTION_TYPE;

  @ManyToOne(() => TeacherQuiz, (teacher_quiz) => teacher_quiz.quiz_question, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'teacher_quiz_id',
    referencedColumnName: 'id',
  })
  teacher_quiz: TeacherQuiz;

  @OneToMany(() => StudentQuiz, (sq) => sq.quiz_question)
  @JoinColumn({ name: 'student_quiz', referencedColumnName: 'id' })
  student_quiz: StudentQuiz;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
