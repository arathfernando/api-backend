import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectGig } from './gig.entity';

@Entity('project_gig_faq')
export class ProjectGigFaq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'question', type: 'varchar', default: null })
  question: string;

  @Column({ name: 'answer', type: 'text', default: null })
  answer: string;

  @ManyToOne(() => ProjectGig, (pg) => pg.packages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_id',
    referencedColumnName: 'id',
  })
  gig: ProjectGig;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
