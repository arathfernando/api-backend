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

@Entity('project_gig_reaction')
export class ProjectGigReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reaction', type: 'text', default: null })
  reaction: string;

  @ManyToOne(() => ProjectGig, (pg) => pg.reaction, {
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
