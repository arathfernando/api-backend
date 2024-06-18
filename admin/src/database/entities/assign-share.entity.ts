import { YES_NO, SHARE_METHOD } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('assign_share', { orderBy: { id: 'ASC' } })
export default class AssignShare {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int', default: null })
  user: number;

  @Column({ name: 'share_area', type: 'int', default: null })
  share_area: number;

  @Column({ name: 'share_price', type: 'int', default: null })
  share_price: number;

  @Column({ name: 'share_qty', type: 'int', default: 0 })
  share_qty: number;

  @Column({
    name: 'share_value',
    type: 'decimal',
    precision: 10,
    scale: 5,
    default: 0,
  })
  share_value: number;

  @Column({ name: 'start_date', type: 'text', default: null })
  start_date: string;

  @Column({
    name: 'share_method',
    type: 'enum',
    enum: SHARE_METHOD,
    default: SHARE_METHOD.INITIAL,
  })
  share_method: SHARE_METHOD;

  @Column({
    name: 'global_share',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  global_share: YES_NO;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
