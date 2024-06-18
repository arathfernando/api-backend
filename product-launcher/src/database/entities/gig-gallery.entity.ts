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

@Entity('project_gig_gallery')
export class ProjectGigGallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_url', type: 'varchar', default: null })
  image_url: string;

  @Column({ name: 'image_title', type: 'text', default: null })
  image_title: string;

  @Column({ name: 'image_description', type: 'text', default: null })
  image_description: string;

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
