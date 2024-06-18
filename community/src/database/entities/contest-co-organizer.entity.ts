import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestCustomerIdentity } from './contest-customer-info.entity';

@Entity('contest_co-organizer')
export class ContestCoOrganizer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email', type: 'varchar', default: null })
  email: string;

  @ManyToOne(() => ContestCustomerIdentity, (c) => c.contest_coorganizer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_customer_identity_id',
  })
  contest_customer_identity: ContestCustomerIdentity;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
