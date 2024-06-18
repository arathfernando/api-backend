import {
  TRANSACTION_FOR_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  OPERATION_TYPE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_id', type: 'text', default: null })
  transaction_id: string;

  @Column({ name: 'contest_prizes_id', type: 'int', default: null })
  contest_prizes_id: number;

  @Column({
    name: 'transaction_from_type',
    type: 'enum',
    enum: TRANSACTION_TYPE,
    default: null,
  })
  transaction_from_type: TRANSACTION_TYPE;

  @Column({
    name: 'transaction_to_type',
    type: 'enum',
    enum: TRANSACTION_TYPE,
    default: null,
  })
  transaction_to_type: TRANSACTION_TYPE;

  @Column({ name: 'transaction_amount', type: 'float', default: null })
  transaction_amount: number;

  @Column({ name: 'area', type: 'int', default: null })
  area: number;

  @Column({ name: 'transaction_from', type: 'int', default: null })
  transaction_from: number;

  @Column({ name: 'transaction_to', type: 'int', default: null })
  transaction_to: number;

  @Column({
    name: 'operation_type',
    type: 'enum',
    enum: OPERATION_TYPE,
    default: null,
  })
  operation_type: OPERATION_TYPE;

  @Column({
    name: 'transaction_for_type',
    type: 'enum',
    enum: TRANSACTION_FOR_TYPE,
    default: null,
  })
  transaction_for_type: TRANSACTION_FOR_TYPE;

  @Column({
    name: 'transaction_status',
    type: 'enum',
    enum: TRANSACTION_STATUS,
    default: null,
  })
  transaction_status: TRANSACTION_STATUS;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
