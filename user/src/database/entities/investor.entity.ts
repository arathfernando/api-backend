import { EXP_INVESTOR, YES_NO } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './';

@Entity('investor_profile', { orderBy: { id: 'ASC' } })
export class InvestorProfile {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    name: 'experience_investor',
    type: 'enum',
    enum: EXP_INVESTOR,
    default: null,
  })
  experience_investor: EXP_INVESTOR;

  @Column({
    name: 'agree_to_invest',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  agree_to_invest: YES_NO;

  @Column({ name: 'investment_currency', type: 'int', default: null })
  investment_currency: number;

  @Column({ name: 'investment_amount', type: 'varchar', default: null })
  investment_amount: string;

  @Column({
    name: 'have_geo_preference',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  have_geo_preference: YES_NO;

  @Column({ name: 'geo_preference', type: 'text', default: null })
  geo_preference: string;

  @Column({ name: 'city', type: 'text', default: null })
  city: string;

  @OneToOne(() => User, (user) => user.investor_profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
