import {
  NOTIFICATION_TYPE,
  SEEN_UNSEEN,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'content', type: 'text', default: null })
  content: string;

  @Column({ name: 'type', type: 'text', default: null })
  type: string;

  @Column({ name: 'notification_from', type: 'int', default: null })
  notification_from: number;

  @Column({ name: 'notification_to', type: 'int', default: null })
  notification_to: number;

  @Column({ name: 'payload', type: 'text', default: null })
  payload: string;

  @Column({ name: 'course_id', type: 'text', default: null })
  course_id: string;

  @Column({
    name: 'seen_unseen',
    type: 'enum',
    enum: SEEN_UNSEEN,
    default: SEEN_UNSEEN.UNSEEN,
  })
  seen_unseen: SEEN_UNSEEN;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NOTIFICATION_TYPE,
    default: NOTIFICATION_TYPE.PERSONAL,
  })
  notification_type: NOTIFICATION_TYPE;

  @Column({
    name: 'sent',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  sent: TRUE_FALSE;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
