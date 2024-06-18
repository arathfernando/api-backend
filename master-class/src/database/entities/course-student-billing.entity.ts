import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseBasic } from './course-basic.entity';

@Entity('student_billing')
export class StudentBilling {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @Column({ name: 'post_code', type: 'text', default: null })
  post_code: string;

  @Column({ name: 'first_name', type: 'text', default: null })
  first_name: string;

  @Column({ name: 'company', type: 'text', default: null })
  company: string;

  @Column({ name: 'last_name', type: 'text', default: null })
  last_name: string;

  @Column({ name: 'address', type: 'text', default: null })
  address: string;

  @Column({ name: 'country', type: 'text', default: null })
  country: string;

  @Column({ name: 'state', type: 'text', default: null })
  state: string;

  @OneToOne(() => CourseBasic, (course_basic) => course_basic.course_payment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
  })
  course_basic: CourseBasic;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
