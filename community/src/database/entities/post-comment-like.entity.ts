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
import { Comments } from './comments.entity';

@Entity('post_comment_like')
export class PostCommentLike {
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

  @ManyToOne(() => Comments, (ct) => ct.comment_likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'comment_id',
  })
  comments: Comments;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
