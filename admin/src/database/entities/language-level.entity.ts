import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Admin from './admin.entity';

@Entity('language_level', { orderBy: { id: 'ASC' } })
export default class LanguageLevel {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'language_level_name', type: 'varchar', default: null })
  language_level_name: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @ManyToOne(() => Admin, (admin) => admin.language_level, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: Admin;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
