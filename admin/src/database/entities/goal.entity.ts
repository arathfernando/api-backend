import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('goals', { orderBy: { id: 'ASC' } })
export default class Goal {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'goal_title', type: 'varchar', default: null })
  goal_title: string;

  @Column({ name: 'goal_image', type: 'varchar', default: null })
  goal_image: string;

  @Column({ name: 'color', type: 'varchar', default: null })
  color: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'goal_number', type: 'int', default: null })
  goal_number: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
