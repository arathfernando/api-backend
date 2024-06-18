import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import WalkthroughCategory from './walkthrough-category.entity';
import { WALKTHROUGH_TYPE } from 'src/helper/constant';

@Entity('walkthrough_step', { orderBy: { id: 'ASC' } })
export default class WalkthroughStep {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'step_name', type: 'text', default: null })
  step_name: string;

  @Column({ name: 'content', type: 'text', default: null })
  content: string;

  @Column({
    name: 'walkthrough_type',
    type: 'enum',
    enum: WALKTHROUGH_TYPE,
    default: null,
  })
  walkthrough_type: WALKTHROUGH_TYPE;

  @Column({
    type: 'int',
    default: null,
  })
  order: number;

  @ManyToOne(() => WalkthroughCategory, (wc) => wc.walkthrough_step, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'walkthrough_category_id',
    referencedColumnName: 'id',
  })
  walkthrough_category: WalkthroughCategory;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
