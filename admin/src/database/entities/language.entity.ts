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

@Entity('language', { orderBy: { id: 'ASC' } })
export default class Language {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'language_code', type: 'varchar', default: null })
  language_code: string;

  @Column({ name: 'language_name', type: 'varchar', default: null })
  language_name: string;

  @Column({ name: 'native_name', type: 'varchar', default: null })
  native_name: string;

  @ManyToOne(() => Admin, (admin) => admin.language, {
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
