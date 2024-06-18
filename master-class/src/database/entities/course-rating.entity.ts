import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseBasic } from './course-basic.entity';
import { ReviewsLike } from './reviews-like.entity';

@Entity('course_rating')
export class CourseRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'over_all_rating', type: 'varchar', default: null })
  over_all_rating: number;

  @Column({ name: 'lesson_content', type: 'varchar', default: null })
  lesson_content: number;

  @Column({ name: 'lesson_activity', type: 'varchar', default: null })
  lesson_activity: number;

  @Column({ name: 'teacher_quality', type: 'varchar', default: null })
  teacher_quality: number;

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @Column({ name: 'comment', type: 'text', default: null })
  comment: string;

  @ManyToOne(() => CourseBasic, (course_basic) => course_basic.course_rating, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_id',
    referencedColumnName: 'id',
  })
  course_basic: CourseBasic;

  @OneToMany(() => ReviewsLike, (reviewsLike) => reviewsLike.course_rating)
  @JoinColumn({ name: 'course_like', referencedColumnName: 'id' })
  course_like: ReviewsLike[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
