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
import Admin from './admin.entity';
import BasicType from './basic-type.entity';

@Entity('basic_type_category', { orderBy: { id: 'ASC' } })
export default class BasicTypeCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'display_name', type: 'varchar', default: null })
  display_name: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  // @OneToOne(() => BasicTypeCategory)
  // @JoinColumn({
  //   name: 'parent_category',
  // })
  // parent_category: BasicTypeCategory;

  @OneToMany(() => BasicType, (bt) => bt.category)
  basic_type_category: BasicType[];

  // @Column({
  //   name: 'include_image',
  //   type: 'enum',
  //   enum: TRUE_FALSE,
  //   default: null,
  // })
  // include_image: TRUE_FALSE;

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
