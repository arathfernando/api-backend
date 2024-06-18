import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { YES_NO } from 'src/helper/constant';
import { Partner } from './';

@Entity('partnership_contact', { orderBy: { id: 'ASC' } })
export class PartnershipContact {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    name: 'has_hubbers_profile',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  has_hubbers_profile: YES_NO;

  @Column({ name: 'user_id', default: null, type: 'varchar' })
  user_id: number;

  @Column({ name: 'email', type: 'varchar', default: null })
  email: string;

  @ManyToOne(() => Partner, (p) => p.contacts)
  @JoinColumn({
    name: 'partner_id',
    referencedColumnName: 'id',
  })
  partner: Partner;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
