import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeneralProfile } from './';

@Entity('profile_badge', { orderBy: { id: 'ASC' } })
export class ProfileBadge {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'badge_id', type: 'int', default: null })
  badge_id: number;

  @ManyToOne(() => GeneralProfile, (gp) => gp.profile_badge, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'profile_id',
  })
  general_profile: GeneralProfile;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
