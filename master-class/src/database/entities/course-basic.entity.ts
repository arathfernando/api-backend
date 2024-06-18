import {
  COURSE_ACCESS_TYPE,
  COURSE_STATUS,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CourseChapter } from './course-chapter.entity';
import { CourseEnrolled } from './course-enrolled.entity';
import { CourseFaq } from './course-faq.entity';
import { CoursePayment } from './course-payment.entity';
import { CourseRating } from './course-rating.entity';
import { CourseReaction } from './course-reaction.entity';
import { CourseStructure } from './course-structure.entity';
import { StudentBilling } from './course-student-billing.entity';
import { StudentPayment } from './curse-student-payment.entity';
import { Instructors } from './instructors.entity';
import { SaveCourse } from './save-course.entity';
import { CourseReport } from './course-report.entity';

@Entity('course_basic')
export class CourseBasic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_title', type: 'varchar', default: null })
  course_title: string;

  @Column({ name: 'course_category', type: 'int', default: null })
  course_category: number;

  @Column({ name: 'course_catch_line', type: 'text', default: null })
  course_catch_line: string;

  @Column({ name: 'course_description', type: 'text', default: null })
  course_description: string;

  @Column({ name: 'language', type: 'int', default: null })
  language: number;

  @Column({ name: 'goals', type: 'int', default: null, array: true })
  goals: string[];

  @Column({ name: 'start_date', type: 'text', default: null })
  start_date: string;

  @Column({ name: 'end_date', type: 'text', default: null })
  end_date: string;

  @OneToOne(() => CourseStructure, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_structure_id', referencedColumnName: 'id' })
  course_structure: CourseStructure;

  @Column({
    name: 'status',
    type: 'enum',
    enum: COURSE_STATUS,
    default: null,
  })
  status: COURSE_STATUS;

  @Column({
    name: 'course_access_type',
    type: 'enum',
    enum: COURSE_ACCESS_TYPE,
    default: null,
  })
  course_access_type: COURSE_ACCESS_TYPE;

  @Column({
    nullable: true,
  })
  course_image: string;

  @OneToMany(
    () => CourseChapter,
    (course_chapter) => course_chapter.course_basic,
  )
  @JoinColumn({ name: 'course_chapter', referencedColumnName: 'id' })
  course_chapter: CourseChapter[];

  @OneToMany(() => CourseReport, (course_report) => course_report.course_basic)
  @JoinColumn({ name: 'course_report', referencedColumnName: 'id' })
  course_report: CourseReport[];

  @OneToMany(() => SaveCourse, (save_course) => save_course.course_basic)
  @JoinColumn({ name: 'save_course', referencedColumnName: 'id' })
  save_course: SaveCourse[];

  @OneToMany(() => Instructors, (instructors) => instructors.course_basic)
  @JoinColumn({ name: 'instructors', referencedColumnName: 'id' })
  instructors: Instructors[];

  @OneToOne(() => CoursePayment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_payment', referencedColumnName: 'id' })
  course_payment: CoursePayment;

  @OneToMany(() => CourseFaq, (CourseFaq) => CourseFaq.course_basic)
  @JoinColumn({ name: 'course_faq', referencedColumnName: 'id' })
  course_faq: CourseFaq[];

  @OneToMany(() => CourseRating, (CourseRating) => CourseRating.course_basic)
  @JoinColumn({ name: 'course_rating', referencedColumnName: 'id' })
  course_rating: CourseRating[];

  @OneToMany(
    () => StudentBilling,
    (StudentBilling) => StudentBilling.course_basic,
  )
  @JoinColumn({ name: 'student_billing', referencedColumnName: 'id' })
  student_billing: StudentBilling[];

  @OneToMany(
    () => StudentPayment,
    (StudentPayment) => StudentPayment.course_basic,
  )
  @JoinColumn({ name: 'student_payment', referencedColumnName: 'id' })
  student_payment: StudentPayment[];

  @OneToMany(
    () => CourseReaction,
    (course_reaction) => course_reaction.course_basic,
  )
  @JoinColumn({ name: 'course_reaction', referencedColumnName: 'id' })
  course_reaction: CourseReaction[];

  @OneToMany(() => CourseEnrolled, (ce) => ce.course_basic)
  @JoinColumn({ name: 'course_enrolled', referencedColumnName: 'id' })
  course_enrolled: CourseEnrolled[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'course_requirements', type: 'varchar', default: null })
  course_requirements: string;

  @Column({ name: 'what_you_will_learn', type: 'varchar', default: null })
  what_you_will_learn: string;

  @Column()
  @CreateDateColumn({ name: 'created_at', select: true })
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
