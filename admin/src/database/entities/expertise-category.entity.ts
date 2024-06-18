import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Admin from './admin.entity';

@Entity('expertise_category', { orderBy: { id: 'ASC' } })
export default class ExpertiseCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  // @Column({ name: 'slug', type: 'varchar', default: null })
  // slug: string;

  @OneToOne(() => Admin)
  @JoinColumn({
    name: 'created_by',
  })
  created_by: Admin;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'icon', type: 'text', default: null })
  icon: string;

  // @OneToOne(() => ExpertiseCategory)
  // @JoinColumn({
  //   name: 'parent_category',
  // })
  // parent_category: ExpertiseCategory;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
