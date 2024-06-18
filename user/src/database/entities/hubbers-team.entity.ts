import { YES_NO } from 'src/helper/constant';
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

@Entity('hubbers_team_profile', { orderBy: { id: 'ASC' } })
export class HubbersTeamProfile {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'avatar', type: 'varchar', default: null })
  avatar: string;

  @Column({ name: 'first_name', type: 'varchar', default: null })
  first_name: string;

  @Column({ name: 'last_name', type: 'varchar', default: null })
  last_name: string;

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'join_date', type: 'text', default: null })
  join_date: string;

  @Column({ name: 'termination_date', type: 'text', default: null })
  termination_date: string;

  @Column({
    type: 'int',
    default: null,
  })
  order: number;

  @Column({
    name: 'is_terminated',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  is_terminated: YES_NO;

  @Column({
    name: 'is_published',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  is_published: YES_NO;

  @OneToOne(() => User, (user) => user.hubbers_team_profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
