import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('innovation_category', { orderBy: { id: 'ASC' } })
export default class InnovationCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'category_name', type: 'varchar', default: null })
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
