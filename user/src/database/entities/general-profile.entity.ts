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
import {
  Education,
  ProfileBadge,
  ProfileGoal,
  SocialMedia,
  UserInterest,
  User,
  WorkExperience,
} from './';
import { ROLES } from 'src/helper/constant';

@Entity('general_profile', { orderBy: { id: 'ASC' } })
export class GeneralProfile {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'avatar', type: 'varchar', default: null })
  avatar: string;

  @Column({ name: 'first_name', type: 'varchar', default: null })
  first_name: string;

  @Column({ name: 'last_name', type: 'varchar', default: null })
  last_name: string;

  @Column({ name: 'location', type: 'varchar', default: null })
  location: string;

  @Column({ name: 'nationality', type: 'varchar', default: null })
  nationality: string;

  @Column({ name: 'birth_date', type: 'varchar', default: null })
  birth_date: string;

  @Column({ name: 'bio', type: 'text', default: null })
  bio: string;

  @Column({ name: 'hbb_points', type: 'float', default: 5 })
  hbb_points: number;

  @Column({
    name: 'walkthrough_category',
    type: 'int',
    default: null,
    array: true,
  })
  walkthrough_category: number[];

  @Column({ name: 'hbs_points', type: 'float', default: null })
  hbs_points: number;

  @Column({ name: 'currency', type: 'int', default: null })
  currency: number;

  @Column({ name: 'role', type: 'enum', enum: ROLES, default: null })
  role: ROLES;

  @Column({ name: 'experience_in_role', type: 'text', default: null })
  experience_in_role: string;

  @OneToMany(() => UserInterest, (ui) => ui.general_profile)
  interest: UserInterest[];

  @Column({
    nullable: true,
  })
  latitude: string;

  @Column({
    nullable: true,
  })
  longitude: string;

  @OneToOne(() => User, (user) => user.general_profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;

  @OneToMany(
    () => WorkExperience,
    (work_experience) => work_experience.general_profile,
  )
  work_experience: WorkExperience[];

  @OneToMany(() => Education, (education) => education.general_profile)
  education: Education[];

  @OneToMany(() => SocialMedia, (social_media) => social_media.general_profile)
  social_media: SocialMedia[];

  @OneToMany(() => ProfileGoal, (pg) => pg.general_profile)
  profile_goal: ProfileGoal[];

  @OneToMany(() => ProfileBadge, (pb) => pb.general_profile)
  profile_badge: ProfileBadge[];

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
