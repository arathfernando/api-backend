import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payment_transaction')
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'webhook_response', type: 'text', default: null })
  webhook_response: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
