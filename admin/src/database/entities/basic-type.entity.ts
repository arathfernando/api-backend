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
import BasicTypeCategory from './basic-type-category.entity';

@Entity('basic_type', { orderBy: { id: 'ASC' } })
export default class BasicType {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @ManyToOne(() => BasicTypeCategory, (btc) => btc.basic_type_category)
  @JoinColumn({
    name: 'basic_type_category_id',
  })
  category: BasicTypeCategory;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'image', type: 'text', default: null })
  image: string;

  @ManyToOne(() => Admin, (admin) => admin.basic_type_category, {
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
