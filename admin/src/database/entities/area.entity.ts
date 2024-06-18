import { YES_NO } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AssignPrice from './assign-price.entity';
import Zone from './zone.entity';

@Entity('area_share', { orderBy: { id: 'ASC' } })
export default class AreaShare {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToOne(() => Zone, (z) => z.area_share_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'zone',
    referencedColumnName: 'id',
  })
  zone: Zone;

  @OneToMany(() => AssignPrice, (btc) => btc.area_share)
  assign_price: AssignPrice;

  @Column({ name: 'share_percentage', type: 'varchar', default: null })
  share_percentage: string;

  @Column({ name: 'amount_share', type: 'int', default: null })
  amount_share: number;

  @Column({ name: 'expected_start_date', type: 'text', default: null })
  expected_start_date: string;

  @Column({
    name: 'global_share',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  global_share: YES_NO;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
