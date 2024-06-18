import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('course_category', { orderBy: { id: 'ASC' } })
export default class CourseCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'names', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @Column({ name: 'prompts_text', type: 'varchar', default: null })
  prompts_text: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
