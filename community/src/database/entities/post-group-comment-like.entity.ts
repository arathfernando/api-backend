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
import { GroupPostComments } from './group-comments.entity';

@Entity('group_post_comment_like')
export class GroupPostCommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'reaction',
    type: 'enum',
    enum: REACTION_TYPE,
    default: null,
  })
  reaction: REACTION_TYPE;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @ManyToOne(() => GroupPostComments, (ct) => ct.group_comment_likes, {
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
