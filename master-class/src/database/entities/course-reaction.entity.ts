import { YES_NO } from 'src/core/constant/enum.constant';
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

@Entity('course_reaction')
export class CourseReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'reaction',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  reaction: YES_NO;

  @ManyToOne(() => CourseBasic, (cb) => cb.course_reaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'id' })
  course_basic: CourseBasic;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
