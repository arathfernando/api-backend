import { COURSE_ACCESS_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('course_structure')
export class CourseStructure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'course_access_type',
    type: 'enum',
    enum: COURSE_ACCESS_TYPE,
    default: null,
  })
  course_access_type: COURSE_ACCESS_TYPE;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
