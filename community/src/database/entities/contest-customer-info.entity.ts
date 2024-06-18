import { YES_NO } from 'src/core/constant/enum.constant';
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
import { ContestCoOrganizer } from './contest-co-organizer.entity';
import { Contest } from './contest.entity';

@Entity('contest_customer_identity')
export class ContestCustomerIdentity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'contest_for_company',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  contest_for_company: YES_NO;

  @Column({ name: 'company_name', type: 'varchar', default: null })
  company_name: string;

  @Column({ name: 'company_address', type: 'varchar', default: null })
  company_address: string;

  @Column({ name: 'country', type: 'varchar', default: null })
  country: string;

  @Column({ name: 'state', type: 'varchar', default: null })
  state: string;

  @Column({ name: 'postcode', type: 'varchar', default: null })
  postcode: string;

  @Column({ name: 'company_website', type: 'varchar', default: null })
  company_website: string;

  @Column({ name: 'company_logo', type: 'varchar', default: null })
  company_logo: string;

  @Column({ name: 'partners', type: 'text', default: null, array: true })
  partners: string[];

  @Column({
    name: 'right_to_organize_contest',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  right_to_organize_contest: YES_NO;

  @OneToMany(() => ContestCoOrganizer, (cm) => cm.contest_customer_identity)
  contest_coorganizer: ContestCoOrganizer[];

  @OneToOne(() => Contest, (contest) => contest.contest_customer_info, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_id',
    referencedColumnName: 'id',
  })
  contest: Contest;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
