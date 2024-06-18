import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_billing')
export class UserBilling {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'text', default: null })
  first_name: string;

  @Column({ name: 'last_name', type: 'text', default: null })
  last_name: string;

  @Column({ name: 'address', type: 'text', default: null })
  address: string;

  @Column({ name: 'country', type: 'text', default: null })
  country: string;

  @Column({ name: 'state', type: 'text', default: null })
  state: string;

  @Column({ name: 'postcode', type: 'text', default: null })
  postcode: string;

  @Column({ name: 'company', type: 'text', default: null })
  company: string;

  @Column({ name: 'user_id', type: 'int', default: null })
  user_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
