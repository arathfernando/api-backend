import { HIDE_UNHIDE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupPostComments } from './group-comments.entity';

@Entity('group_post_comment_hide')
export class GroupPostCommentHide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'post_comment_status',
    type: 'enum',
    enum: HIDE_UNHIDE,
    default: null,
  })
  post_comment_status: HIDE_UNHIDE;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @ManyToOne(() => GroupPostComments, (ct) => ct.group_comment_hide, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'comment_id',
  })
  comments: GroupPostComments;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
