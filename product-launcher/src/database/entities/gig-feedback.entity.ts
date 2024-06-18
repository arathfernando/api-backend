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
import { ProjectGigFeedbackReaction } from './feedback-reaction.entity';
import { ProjectGig } from './gig.entity';

@Entity('project_gig_feedback')
export class ProjectGigFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'over_all_rating', type: 'float4', default: null })
  over_all_rating: number;

  @Column({ name: 'expertise_content_rating', type: 'float4', default: null })
  expertise_content_rating: number;

  @Column({ name: 'delivery_rating', type: 'float4', default: null })
  delivery_rating: number;

  @Column({ name: 'results_rating', type: 'float4', default: null })
  results_rating: number;

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @ManyToOne(() => ProjectGig, (pg) => pg.packages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_id',
    referencedColumnName: 'id',
  })
  gig: ProjectGig;

  @OneToMany(() => ProjectGigFeedbackReaction, (pgg) => pgg.feedback)
  reaction: ProjectGigFeedbackReaction[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
