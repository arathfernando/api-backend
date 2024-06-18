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
import { CourseRating } from './course-rating.entity';

@Entity('reviews_like')
export class ReviewsLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'helpful',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  helpful: YES_NO;

  @ManyToOne(() => CourseRating, (courseRating) => courseRating.course_like, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'course_rating_id',
    referencedColumnName: 'id',
  })
  course_rating: CourseRating;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
