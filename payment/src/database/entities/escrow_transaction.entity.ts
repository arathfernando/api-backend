import {
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('escrow_transaction')
export class EscrowTransaction {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ name: 'transaction_from', type: 'int', default: null })
  transaction_from: number;

  @Column({ name: 'transaction_from_payment_id', type: 'int', default: null })
  transaction_from_payment_id: number;

  @Column({ name: 'transaction_to', type: 'int', default: null })
  transaction_to: number;

  @Column({ name: 'transaction_to_payment_id', type: 'int', default: null })
  transaction_to_payment_id: number;

  @Column({ name: 'transaction_details', type: 'text', default: null })
  transaction_details: string;

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
