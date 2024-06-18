import { COURSE_ACCESS_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CourseBasic } from './course-basic.entity';
import { CourseLesson } from './course-lesson.entity';

@Entity('course_chapter')
export class CourseChapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'course_access_type',
    type: 'enum',
    enum: COURSE_ACCESS_TYPE,
    default: COURSE_ACCESS_TYPE.FREE,
  })
  course_access_type: COURSE_ACCESS_TYPE;

  @Column({ name: 'chapter_title', type: 'text', default: null })
  chapter_title: string;

  @Column({ name: 'chapter_description', type: 'text', default: null })
  chapter_description: string;

  @Column({ name: 'media', type: 'text', default: null, array: true })
  media: string[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @OneToMany(
    () => CourseLesson,
    (course_lesson) => course_lesson.course_chapter,
  )
  course_lesson: CourseLesson[];

  @ManyToOne(() => CourseBasic, (course_basic) => course_basic.instructors, {
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
