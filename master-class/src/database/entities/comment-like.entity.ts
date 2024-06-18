import { REACTION_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LessonActivityComment } from './lesson-activity-comment.entity';

@Entity('lesson_activity_comments_like')
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(
    () => LessonActivityComment,
    (course_activity) => course_activity.comment_like,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'lesson_activity_comment_id',
    referencedColumnName: 'id',
  })
  lesson_activity_comment: LessonActivityComment;

  @Column({
    name: 'reaction',
    type: 'enum',
    enum: REACTION_TYPE,
    default: null,
  })
  reaction: REACTION_TYPE;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
