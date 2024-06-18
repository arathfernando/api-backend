import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import ProductSubCategory from './product-subcategory.entity';

@Entity('product_subcategory_faq')
export class ProductSubCategoryFaq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'question', type: 'varchar', default: null })
  question: string;

  @Column({ name: 'default_answer', type: 'text', default: null })
  default_answer: string;

  @Column({ name: 'answer', type: 'text', default: null, array: true })
  answer: string[];

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @Column({ name: 'percentage', type: 'int', default: 0 })
  percentage: number;

  @Column({ name: 'order', type: 'int', default: null })
  order: number;

  @ManyToOne(() => ProductSubCategory, (psc) => psc.product_subcategory_faq, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'product_subcategory_id',
    referencedColumnName: 'id',
  })
  product_subcategory: ProductSubCategory;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
