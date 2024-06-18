import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Comments } from './comments.entity';

@Entity('post_comment_report', { orderBy: { id: 'ASC' } })
export class PostCommentReport {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'reason', type: 'varchar', default: null })
  reason: string;

  @Column({ name: 'response', type: 'varchar', default: null })
  response: string;

  @ManyToOne(() => Comments, (ct) => ct.comment_report, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'comment_id',
  })
  comments: Comments;

  @Column()
  user_id: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
