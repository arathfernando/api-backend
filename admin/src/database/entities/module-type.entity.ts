import { YES_NO } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('module_type', { orderBy: { id: 'ASC' } })
export default class ModuleType {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'slug', type: 'varchar', default: null })
  slug: string;

  @Column({ name: 'short_description', type: 'varchar', default: null })
  short_description: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @Column({ name: 'image', type: 'varchar', default: null })
  image: string;

  @Column({ nullable: true, type: 'varchar', default: null })
  partner_id: number;

  @Column({
    name: 'published',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  published: YES_NO;

  @Column({
    name: 'cobuilding',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  cobuilding: YES_NO;

  @Column({
    name: 'beta_testing',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  beta_testing: YES_NO;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
