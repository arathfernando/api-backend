import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Partner } from './';

@Entity('partner_contact_us', { orderBy: { id: 'ASC' } })
export class PartnerContactUs {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    default: null,
  })
  first_name: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    default: null,
  })
  last_name: string;

  @Column({
    name: 'email',
    type: 'varchar',
    default: null,
  })
  email: string;

  @Column({
    name: 'subject',
    type: 'varchar',
    default: null,
  })
  subject: string;

  @Column({
    name: 'message',
    type: 'varchar',
    default: null,
  })
  message: string;

  @ManyToOne(() => Partner, (pc) => pc.partner_contact_us, {
    onDelete: 'CASCADE',
  })
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
