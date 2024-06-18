import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectGig } from './gig.entity';

@Entity('project_gig_category')
export class ProjectGigCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @Column({ name: 'cover', type: 'text', default: null })
  cover: string;

  @ManyToMany(() => ProjectGig, (pg) => pg.categories)
  @JoinTable({
    name: 'gig_with_category',
    joinColumn: { name: 'category_id' },
    inverseJoinColumn: { name: 'gig_id' },
  })
  gigs: ProjectGig[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
