import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tech_category', { orderBy: { id: 'ASC' } })
export default class TechCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'tech_category_name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
