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

@Entity('user_interest', { orderBy: { id: 'ASC' } })
export class UserInterest {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int', name: 'type_category', default: null })
  type_category: number;

  @Column('int', {
    array: true,
  })
  interests: number[];

  @ManyToOne(() => GeneralProfile, (gp) => gp.interest, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'general_profile_id',
  })
  general_profile: GeneralProfile;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
