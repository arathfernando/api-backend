import { SEEN_UNSEEN } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { LessonActivity } from './lesson-activity.entity';

@Entity('lesson_activity_mark')
export class LessonActivityMark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'seen_unseen',
    type: 'enum',
    enum: SEEN_UNSEEN,
    default: null,
  })
  seen_unseen: SEEN_UNSEEN;

  @ManyToOne(
    () => LessonActivity,
    (lesson_activity) => lesson_activity.lesson_activity_mark,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'lesson_activity_id',
    referencedColumnName: 'id',
  })
  lesson_activity: LessonActivity;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
