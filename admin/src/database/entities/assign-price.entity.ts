import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AreaShare from './area.entity';

@Entity('assign_price', { orderBy: { id: 'ASC' } })
export default class AssignPrice {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => AreaShare, (a) => a.assign_price)
  @JoinColumn({
    name: 'area_share',
  })
  area_share: AreaShare;

  @Column({
    name: 'price_share',
    type: 'decimal',
    precision: 10,
    scale: 5,
    default: 0,
  })
  price_share: number;

  @Column({ name: 'from_which_date', type: 'text', default: null })
  from_which_date: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
