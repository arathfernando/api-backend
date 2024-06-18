import { SETTING_STATUS } from '../../helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountSetting } from './';

@Entity('settings', { orderBy: { id: 'ASC' } })
export class Setting {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'key', type: 'varchar', default: null })
  key: string;

  @Column({ name: 'display_name', type: 'varchar', default: null })
  display_name: string;

  @Column({ name: 'type', type: 'varchar', default: null })
  type: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SETTING_STATUS,
    default: SETTING_STATUS.ACTIVE,
  })
  status: SETTING_STATUS;

  @Column({ name: 'default', type: 'varchar', default: null })
  default: string;

  @OneToMany(() => AccountSetting, (as) => as.setting)
  account_setting: AccountSetting[];

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
