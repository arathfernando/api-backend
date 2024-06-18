import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin_notification', { orderBy: { id: 'ASC' } })
export default class AdminNotification {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'notification_content', type: 'text', default: null })
  notification_content: string;

  @Column({ name: 'notification_title', type: 'varchar', default: null })
  notification_title: string;

  @Column({ name: 'notification_type', type: 'varchar', default: null })
  notification_type: string;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
