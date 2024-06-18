import {
  COURSE_PRICING_TYPE,
  PRICING_CURRENCY,
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

@Entity('course_payment')
export class CoursePayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'pricing_currency',
    type: 'enum',
    enum: PRICING_CURRENCY,
    default: null,
  })
  pricing_currency: PRICING_CURRENCY;

  @Column({
    name: 'pricing_type',
    type: 'enum',
    enum: COURSE_PRICING_TYPE,
    default: null,
  })
  pricing_type: COURSE_PRICING_TYPE;

  @Column({ name: 'pricing', type: 'int', default: null })
  pricing: number;

  @Column({ name: 'installment', type: 'int', default: null })
  installment: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

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
