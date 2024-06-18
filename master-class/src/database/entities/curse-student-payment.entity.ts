import {
  PAYMENT_METHOD,
  PAYMENT_OPTION,
} from 'src/core/constant/enum.constant';
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

@Entity('student_payment')
export class StudentPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'amount', type: 'int', default: null })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PAYMENT_METHOD,
    default: null,
  })
  payment_method: PAYMENT_METHOD;

  @Column({
    name: 'payment_option',
    type: 'enum',
    enum: PAYMENT_OPTION,
    default: null,
  })
  payment_option: PAYMENT_OPTION;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

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
