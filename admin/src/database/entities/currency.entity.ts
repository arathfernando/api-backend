import { TRUE_FALSE } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('currency', { orderBy: { id: 'ASC' } })
export default class Currency {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'name_plural', type: 'varchar', default: null })
  name_plural: string;

  @Column({ name: 'symbol', type: 'varchar', default: null })
  symbol: string;

  @Column({ name: 'symbol_native', type: 'varchar', default: null })
  symbol_native: string;

  @Column({ name: 'currency_code', type: 'varchar', default: null })
  currency_code: string;

  @Column({ name: 'decimal_digit', type: 'varchar', default: null })
  decimal_digit: string;

  @Column({ name: 'rounding', type: 'varchar', default: null })
  rounding: string;

  @Column({
    name: 'is_crypto',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  is_crypto: TRUE_FALSE;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
