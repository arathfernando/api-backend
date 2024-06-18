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
import { TeacherFileAssignment } from './teacher-file-assignment.entity';
import { StudentFileAssignmentFeedback } from './student-file-assignment-feedback.entity';
import { StudentFileAssignmentGrade } from './student-file-assignment-grade.entity';

@Entity('student_file_assignment')
export class StudentFileAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'add_file', type: 'text', default: null, array: true })
  add_file: string[];

  @ManyToOne(
    () => TeacherFileAssignment,
    (sfa) => sfa.student_file_assignment,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'teacher_file_assignment_id',
    referencedColumnName: 'id',
  })
  teacher_file_assignment: TeacherFileAssignment;

  @OneToMany(
    () => StudentFileAssignmentFeedback,
    (sff) => sff.student_file_assignment,
  )
  student_file_assignment_feedback: StudentFileAssignmentFeedback[];

  @OneToMany(
    () => StudentFileAssignmentGrade,
    (sff) => sff.student_file_assignment,
  )
  student_file_assignment_grade: StudentFileAssignmentGrade[];

  @Column({ name: 'status', type: 'text', default: null })
  status: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
