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
import { CommentLike } from './comment-like.entity';
import { LessonActivity } from './lesson-activity.entity';

@Entity('lesson_activity_comments')
export class LessonActivityComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(
    () => LessonActivity,
    (course_activity) => course_activity.lesson_activity_comment,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'lesson_activity_id',
    referencedColumnName: 'id',
  })
  lesson_activity: LessonActivity;

  @ManyToOne(
    () => LessonActivityComment,
    (lessoncomment) => lessoncomment.children,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parent_id' })
  parent: LessonActivityComment;

  @OneToMany(
    () => LessonActivityComment,
    (lessoncomment) => lessoncomment.parent,
  )
  children: LessonActivityComment[];

  @OneToMany(
    () => CommentLike,
    (lessoncomment) => lessoncomment.lesson_activity_comment,
  )
  comment_like: CommentLike[];

  @Column({ name: 'parent_comment', type: 'varchar', default: null })
  parent_comment: number;

  @Column({ name: 'comment', type: 'text', default: null })
  comment: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
