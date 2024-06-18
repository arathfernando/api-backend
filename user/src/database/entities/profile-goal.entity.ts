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

@Entity('profile_goal', { orderBy: { id: 'ASC' } })
export class ProfileGoal {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'goal_id', type: 'int', default: null })
  goal_id: number;

  @ManyToOne(() => GeneralProfile, (gp) => gp.profile_badge, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'profile_id',
  })
  general_profile: GeneralProfile;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
