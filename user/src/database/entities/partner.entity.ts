import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  PARTNERSHIP_AREA,
  PARTNERSHIP_DURATION,
  STATUS,
  YES_NO,
} from 'src/helper/constant';
import { PartnershipContact, PartnerContactUs } from './';

@Entity('partner', { orderBy: { id: 'ASC' } })
export class Partner {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    name: 'partner_name',
    unique: true,
    type: 'varchar',
    default: null,
  })
  partner_name: string;

  @Column({ name: 'partner_slug', type: 'varchar', default: null })
  partner_slug: string;

  @Column({ name: 'partner_link', default: null, type: 'varchar' })
  partner_link: string;

  @Column({
    nullable: true,
  })
  partner_image: string;

  @Column({ name: 'partner_description', type: 'varchar', default: null })
  partner_description: string;

  @Column({ name: 'partner_type', type: 'varchar', default: null })
  partner_type: number;

  @Column({ type: 'text', name: 'community', default: null })
  community: string;

  @Column({ type: 'text', name: 'goals', default: null })
  goals?: string;

  @Column({ name: 'partnership_activity', type: 'varchar', default: null })
  partnership_activity: string;

  @Column({ name: 'partnership_engagement', type: 'varchar', default: null })
  partnership_engagement: string;

  @Column({ name: 'partnership_goal', type: 'varchar', default: null })
  partnership_goal: string;

  @OneToMany(() => PartnershipContact, (pc) => pc.partner)
  contacts: PartnershipContact[];

  @OneToMany(() => PartnerContactUs, (pc) => pc.partner)
  partner_contact_us: PartnerContactUs[];

  @Column({
    name: 'have_expertise',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  have_expertise: YES_NO;

  @Column({
    name: 'have_contest',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  have_contest: YES_NO;

  @Column('int', { array: true, default: null })
  expertise: number[];

  @Column('int', { array: true, default: null })
  contest: number[];

  @Column({ name: 'language', type: 'text', default: null })
  language: string;

  @Column({
    name: 'support_project',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  support_project: YES_NO;

  @Column({
    name: 'partnership_area',
    type: 'enum',
    enum: PARTNERSHIP_AREA,
    default: null,
  })
  partnership_area: PARTNERSHIP_AREA;

  @Column('int', { array: true, default: null })
  projects: string[];

  @Column({
    name: 'partnership_duration',
    type: 'enum',
    enum: PARTNERSHIP_DURATION,
    default: null,
  })
  partnership_duration: PARTNERSHIP_DURATION;

  @Column({ name: 'partnership_start_date', type: 'text', default: null })
  partnership_start_date: string;

  @Column({ name: 'partnership_end_date', type: 'text', default: null })
  partnership_end_date: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: STATUS,
    default: STATUS.INACTIVE,
  })
  status: STATUS;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
