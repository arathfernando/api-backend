import { TIME_AVAILABILITY, YES_NO } from 'src/helper/constant';
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

@Entity('expert_profile', { orderBy: { id: 'ASC' } })
export class ExpertProfile {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'expertise', type: 'varchar', default: null, array: true })
  expertise: string[];

  @Column({ name: 'extra_expertise', type: 'text', default: null, array: true })
  extra_expertise: string[];

  @Column({ name: 'skills', type: 'int', default: null, array: true })
  skills: number[];

  @Column({ name: 'rate_currency', type: 'int', default: null })
  rate_currency: number;

  @Column({ name: 'charge_per_hour', type: 'varchar', default: null })
  charge_per_hour: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'profile_tagline', type: 'varchar', default: null })
  profile_tagline: string;

  @Column({
    name: 'time_availability',
    type: 'enum',
    enum: TIME_AVAILABILITY,
    default: null,
  })
  time_availability: TIME_AVAILABILITY;

  @Column({ name: 'hour_per_week', type: 'varchar', default: null })
  hour_per_week: string;

  @Column({
    name: 'want_to_earn_hbb',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  want_to_earn_hbb: YES_NO;

  @Column({ name: 'portfolio_link', type: 'text', default: null })
  portfolio_link: string;

  @OneToOne(() => User, (user) => user.expert_profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
