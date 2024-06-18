import { CONTENT_TYPE, REPORT_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseBasic } from './course-basic.entity';

@Entity('course_report')
export class CourseReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: CONTENT_TYPE,
    default: null,
  })
  content_type: CONTENT_TYPE;

  @Column({
    name: 'report_type',
    type: 'enum',
    enum: REPORT_TYPE,
    default: null,
  })
  report_type: REPORT_TYPE;

  @Column({
    nullable: true,
  })
  content_url: string;

  @Column({ name: 'proof_of_your_copyright', type: 'text', default: null })
  proof_of_your_copyright: string;

  @Column({ name: 'file_description', type: 'text', default: null })
  description: string;

  @ManyToOne(() => CourseBasic, (cr) => cr.course_report)
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
