import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import ProductCategory from './product-category.entity';
import { ProductSubCategoryFaq } from './product-subcategory-faq.entity';

@Entity('product_subcategory', { orderBy: { id: 'ASC' } })
export default class ProductSubCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'product_subcategory_name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'cover', type: 'text', default: null })
  cover: string;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @ManyToOne(() => ProductCategory, (c) => c.product_subcategory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_category_id',
  })
  product_category: ProductCategory;

  @Column({ name: 'order', type: 'int', default: null })
  order: number;

  @OneToMany(() => ProductSubCategoryFaq, (ps) => ps.product_subcategory)
  product_subcategory_faq: ProductSubCategoryFaq[];

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
