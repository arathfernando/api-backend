import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentFileAssignment } from './student-file-assignment.entity';

@Entity('student_file_assignment_grade')
export class StudentFileAssignmentGrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'grade', type: 'varchar', default: null })
  grade: number;

  @ManyToOne(
    () => StudentFileAssignment,
    (sfa) => sfa.student_file_assignment_grade,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'student_file_assignment_id',
    referencedColumnName: 'id',
  })
  student_file_assignment: StudentFileAssignment;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
