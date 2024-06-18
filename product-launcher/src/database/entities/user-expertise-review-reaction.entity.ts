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

@Entity('user_expertise_review_reaction')
export class UserExpertiseReviewReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reaction', type: 'text', default: null })
  reaction: string;

  @ManyToOne(
    () => UserExpertiseReview,
    (pg) => pg.user_expertise_review_reaction,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_expertise_review_id',
    referencedColumnName: 'id',
  })
  user_expertise_review: UserExpertiseReview;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
