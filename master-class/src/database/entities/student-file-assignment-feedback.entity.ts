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

@Entity('student_file_assignment_feedback')
export class StudentFileAssignmentFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'feedback', type: 'text', default: null })
  feedback: string;

  @ManyToOne(
    () => StudentFileAssignment,
    (sfa) => sfa.student_file_assignment_feedback,
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
