import { YES_NO } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectGigFeedback } from './gig-feedback.entity';

@Entity('project_gig_feedback_reaction')
export class ProjectGigFeedbackReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'is_helpful',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  is_helpful: YES_NO;

  @ManyToOne(() => ProjectGigFeedback, (pg) => pg.reaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'feedback_id',
    referencedColumnName: 'id',
  })
  feedback: ProjectGigFeedback;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
