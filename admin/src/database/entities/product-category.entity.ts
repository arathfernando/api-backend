import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import ProductSubCategory from './product-subcategory.entity';

@Entity('product_category', { orderBy: { id: 'ASC' } })
export default class ProductCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'category_name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'cover', type: 'text', default: null })
  cover: string;

  @OneToMany(() => ProductSubCategory, (ps) => ps.product_category)
  product_subcategory: ProductSubCategory[];

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @Column({ name: 'order', type: 'int', default: null })
  order: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
