import { WHEN_LAUNCH, YES_NO } from 'src/helper/constant';
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

@Entity('creator_profile', { orderBy: { id: 'ASC' } })
export class CreatorProfile {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    name: 'launching_new_product',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  launching_new_product: YES_NO;

  @Column({
    name: 'built_product',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  built_product: YES_NO;

  @Column({ name: 'portfolio_link', type: 'varchar', default: null })
  portfolio_link: string;

  @Column({ name: 'profile_tagline', type: 'varchar', default: null })
  profile_tagline: string;

  @Column({
    name: 'when_launching_product',
    type: 'enum',
    enum: WHEN_LAUNCH,
    default: null,
  })
  when_launching_product: WHEN_LAUNCH;

  @Column({
    name: 'have_team',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  have_team: YES_NO;

  @Column({ name: 'expertise', type: 'varchar', default: null, array: true })
  expertise: string[];

  @Column({ name: 'extra_expertise', type: 'text', default: null, array: true })
  extra_expertise: string[];

  @Column({ name: 'project_description', type: 'text', default: null })
  project_description: string;

  @OneToOne(() => User, (user) => user.creator_profile, {
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
