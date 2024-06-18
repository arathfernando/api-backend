import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Setting, User } from './';

@Entity('account_settings', { orderBy: { id: 'ASC' } })
export class AccountSetting {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => Setting, (s) => s.account_setting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'setting_id',
  })
  setting: Setting;

  @Column({ name: 'value', type: 'varchar', default: null })
  value: string;

  @ManyToOne(() => User, (u) => u.account_settings, {
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
