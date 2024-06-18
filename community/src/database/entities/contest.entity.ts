import {
  CONTEST_STATE,
  TRUE_FALSE,
  YES_NO,
} from 'src/core/constant/enum.constant';
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
import { ContestContestant } from './contest-contestant.entity';
import { ContestCriteria } from './contest-criteria.entity';
import { ContestCustomerIdentity } from './contest-customer-info.entity';
import { ContestReaction } from './contest-reaction.entity';
import { ContestRules } from './contest-rules.entity';
import { ContestSubmission } from './contest-submissions.entity';

@Entity('contests')
export class Contest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contest_type_id', type: 'varchar', default: null })
  contest_type_id: number;

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @Column('int', { array: true })
  industry: string[];

  @Column('int', { array: true })
  goals: string[];

  @Column('int', { array: true })
  tech: string[];

  @Column({
    name: 'launch_globally',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  launch_globally: YES_NO;

  @Column({ name: 'country_contest', type: 'varchar', default: null })
  country_contest: number;

  @Column({ name: 'no_of_participants', type: 'varchar', default: null })
  no_of_participants: number;

  @Column({
    name: 'everyone_can_participate',
    type: 'enum',
    enum: TRUE_FALSE,
    default: null,
  })
  everyone_can_participate: TRUE_FALSE;

  @Column({ name: 'hubbers_point_attribute', type: 'varchar', default: null })
  hubbers_point_attribute: number;

  @Column({ name: 'no_of_judges', type: 'varchar', default: null })
  no_of_judges: number;

  @Column({ name: 'no_of_extra_judges', type: 'varchar', default: null })
  no_of_extra_judges: number;

  @Column({ name: 'no_of_revisions', type: 'varchar', default: null })
  no_of_revisions: number;

  @Column({ name: 'contest_cover', type: 'varchar', default: null })
  contest_cover: string;

  @Column({ name: 'contest_start_date', type: 'varchar', default: null })
  contest_start_date: string;

  @Column({ name: 'contest_end_date', type: 'varchar', default: null })
  contest_end_date: string;

  @Column({ type: 'text', default: null })
  social_links: string;

  @Column({
    name: 'contest_state',
    type: 'enum',
    enum: CONTEST_STATE,
    default: CONTEST_STATE.DRAFTED,
  })
  contest_state: CONTEST_STATE;

  @OneToOne(
    () => ContestCustomerIdentity,
    (contestCustomerInfo) => contestCustomerInfo.contest,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'customer_info_id',
    referencedColumnName: 'id',
  })
  contest_customer_info: ContestCustomerIdentity;

  @OneToOne(() => ContestCriteria, (cc) => cc.contest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_criteria_id',
    referencedColumnName: 'id',
  })
  contest_criteria: ContestCriteria;

  @OneToOne(() => ContestRules, (cr) => cr.contest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_rules_id',
    referencedColumnName: 'id',
  })
  contest_rules: ContestRules;

  @OneToMany(() => ContestContestant, (cp) => cp.contest, {
    onDelete: 'CASCADE',
  })
  contestant: ContestContestant[];

  @OneToMany(() => ContestReaction, (cr) => cr.contest, {
    onDelete: 'CASCADE',
  })
  reaction: ContestReaction[];

  @OneToMany(() => ContestSubmission, (cp) => cp.contest, {
    onDelete: 'CASCADE',
  })
  contest_submissions: ContestSubmission[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({ name: 'published_date', type: 'text', default: null })
  published_date: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
