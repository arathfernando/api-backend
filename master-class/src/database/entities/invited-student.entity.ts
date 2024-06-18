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
import { INVITE_STATUS } from 'src/core/constant/enum.constant';

@Entity('invites_student')
export class InvitedStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CourseBasic, (cb) => cb.course_enrolled, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'id' })
  course_basic: CourseBasic;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'user_id', type: 'int', default: null })
  user_id: number;

  @Column({
    name: 'invite_status',
    type: 'enum',
    enum: INVITE_STATUS,
    default: null,
  })
  invite_status: INVITE_STATUS;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
