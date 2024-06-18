import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import {
  ROLES,
  STATUS,
  TRUE_FALSE,
  USER_CREATED_BY,
  USER_STATE,
} from 'src/helper/constant';
import {
  GeneralProfile,
  CreatorProfile,
  ExpertProfile,
  InvestorProfile,
  HubbersTeamProfile,
  AccountSetting,
  TeacherProfile,
  UserPortfolio,
  ExpertProfileReaction,
} from './';

@Entity('users', { orderBy: { id: 'ASC' } })
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'profile_uid', type: 'varchar', default: null })
  profile_uid: string;

  @Column({
    name: 'email',
    unique: true,
    default: null,
    type: 'text',
  })
  email: string;

  @Column({ name: 'hashed_refresh_token', nullable: true, select: false })
  @Exclude()
  public hashed_refresh_token?: string;

  @Column({ name: 'password', type: 'varchar', select: true })
  password: string;

  @Column({ name: 'role', type: 'enum', enum: ROLES, default: null })
  role: ROLES;

  @Column({
    name: 'status',
    type: 'enum',
    enum: STATUS,
    default: STATUS.INACTIVE,
  })
  status: STATUS;

  @Column({
    name: 'user_state',
    type: 'enum',
    enum: USER_STATE,
    default: USER_STATE.OFFLINE,
  })
  user_state: USER_STATE;

  @Column({ type: 'text', name: 'verification_code', nullable: true })
  verification_code?: string;

  @Column({ type: 'text', name: 'fcm_token', nullable: true, default: null })
  fcm_token?: string;

  @Column({ type: 'text', name: 'closed_date', nullable: true, default: null })
  closed_date: string;

  @Column({ name: 'reset_password_otp', nullable: true, select: true })
  @Exclude()
  reset_password_otp?: string;

  @Column({
    name: 'is_hubber_team',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  is_hubber_team: TRUE_FALSE;

  @Column({
    name: 'is_completed_three_step_process',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  is_completed_three_step_process: TRUE_FALSE;

  @Column({
    name: 'has_new_notification',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  has_new_notification: TRUE_FALSE;

  @Column({
    name: 'has_new_message',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  has_new_message: TRUE_FALSE;

  @Column({
    name: 'is_verified_id_by_code',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  is_verified_id_by_code: TRUE_FALSE;

  @Column({ name: 'otp', type: 'varchar', default: null })
  otp: number;

  @Column({
    name: 'user_created_by',
    type: 'enum',
    enum: USER_CREATED_BY,
    default: USER_CREATED_BY.SELF,
  })
  user_created_by: USER_CREATED_BY;

  @Column({ name: 'linkedin_id', unique: true, default: null, type: 'varchar' })
  linkedin_id: string;

  @Column({ name: 'apple_id', unique: true, default: null, type: 'text' })
  apple_id: string;

  @Column({
    name: 'is_login_with_linkedin',
    type: 'boolean',
    default: false,
  })
  is_login_with_linkedin: boolean;

  @Column({
    name: 'is_login_with_apple',
    type: 'boolean',
    default: true,
  })
  is_login_with_apple: boolean;

  @OneToOne(() => GeneralProfile, (generalProfile) => generalProfile.user, {
    cascade: true,
  })
  @JoinColumn({
    name: 'general_profile',
    referencedColumnName: 'id',
  })
  general_profile: GeneralProfile;

  @OneToOne(() => CreatorProfile, (cp) => cp.user, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'creator_profile',
  })
  creator_profile: CreatorProfile;

  @OneToOne(() => ExpertProfile, (ep) => ep.user, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'expert_profile',
  })
  expert_profile: ExpertProfile;

  @OneToOne(() => InvestorProfile, (ip) => ip.user, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'investor_profile',
  })
  investor_profile: InvestorProfile;

  @OneToOne(() => TeacherProfile, (ip) => ip.user, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'teacher_profile',
  })
  teacher_profile: TeacherProfile;

  @OneToOne(() => HubbersTeamProfile, (hp) => hp.user, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'hubbers_team_profile',
  })
  hubbers_team_profile: HubbersTeamProfile;

  @OneToMany(() => AccountSetting, (as) => as.user)
  account_settings: AccountSetting[];

  @OneToMany(() => ExpertProfileReaction, (as) => as.user)
  expert_profile_reaction: ExpertProfileReaction[];

  @OneToMany(() => UserPortfolio, (as) => as.user)
  user_portfolio: UserPortfolio[];

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
