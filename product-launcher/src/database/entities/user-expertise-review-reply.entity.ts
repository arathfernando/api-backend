import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserExpertiseReview } from './user-expertise-review.entity';

@Entity('user_expertise_review_reply')
export class UserExpertiseReviewReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(
    () => UserExpertiseReview,
    (pg) => pg.user_expertise_review_reply,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_expertise_review_id',
    referencedColumnName: 'id',
  })
  user_expertise_review: UserExpertiseReview;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
