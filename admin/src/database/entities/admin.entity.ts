import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ADMIN_ROLES, STATUS, TRUE_FALSE } from 'src/helper/constant';
import BasicTypeCategory from './basic-type-category.entity';
import Language from './language.entity';
import LanguageLevel from './language-level.entity';

@Entity('admin', { orderBy: { id: 'ASC' } })
export default class Admin {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'profile_image', type: 'varchar', default: null })
  profile_image: string;

  @Column({ name: 'first_name', type: 'varchar', default: null })
  first_name: string;

  @Column({ name: 'last_name', type: 'varchar', default: null })
  last_name: string;

  @Column({ name: 'email', unique: true, default: null, type: 'varchar' })
  email: string;

  @Column({ name: 'hashed_refresh_token', nullable: true, select: false })
  @Exclude()
  public hashed_refresh_token?: string;

  @Column({ name: 'password', type: 'varchar', select: true })
  password: string;

  @Column({ name: 'country_code', type: 'varchar', default: null })
  country_code: string;

  @Column({
    name: 'is_2fa_active',
    type: 'enum',
    enum: TRUE_FALSE,
    select: true,
    default: TRUE_FALSE.FALSE,
  })
  is_2fa_active: TRUE_FALSE;

  @Column({
    name: 'mobile_number',
    type: 'varchar',
    select: true,
    default: null,
  })
  mobile_number: string;

  @Column({ name: 'role', type: 'enum', enum: ADMIN_ROLES, default: null })
  role: ADMIN_ROLES;

  @Column({
    name: 'status',
    type: 'enum',
    enum: STATUS,
    default: STATUS.INACTIVE,
  })
  status: STATUS;

  @Column({ type: 'text', name: 'verification_code', nullable: true })
  verification_code?: string;

  @Column({ name: 'reset_password_otp', nullable: true, select: true })
  @Exclude()
  reset_password_otp?: string;

  @Column({ name: 'admin_role', type: 'int', default: null, array: true })
  admin_role: string[];

  @OneToMany(() => BasicTypeCategory, (btc) => btc.user)
  basic_type_category: BasicTypeCategory[];

  @OneToMany(() => Language, (lang) => lang.user)
  language: Language[];

  @OneToMany(() => LanguageLevel, (lang) => lang.user)
  language_level: LanguageLevel[];

  @Column({
    name: 'has_new_notification',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  has_new_notification: TRUE_FALSE;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
