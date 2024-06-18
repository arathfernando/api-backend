import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import WalkthroughStep from './walkthrough-step.entity';

@Entity('walkthrough_category', { orderBy: { id: 'ASC' } })
export default class WalkthroughCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'category_name', type: 'text', default: null, unique: true })
  category_name: string;

  @Column({ name: 'step', type: 'text', default: null, array: true })
  step: string[];

  @OneToMany(() => WalkthroughStep, (ws) => ws.walkthrough_category)
  walkthrough_step: WalkthroughStep[];

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
