import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestCriteria } from './contest-criteria.entity';
import { ContestTemplates } from './contest-template.entity';
import { ContestClaimPrize } from './contest-claim-prize.entity';

@Entity('contest_prize')
export class ContestPrize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'amount', type: 'varchar', default: null })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', default: null })
  currency: string;

  @Column({ name: 'royalty', type: 'varchar', default: null })
  royalty: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @ManyToOne(() => ContestCriteria, (c) => c.contest_prizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'criteria_id',
  })
  contest_criteria: ContestCriteria;

  @ManyToOne(() => ContestTemplates, (c) => c.contest_prizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'template_id',
  })
  contest_template: ContestTemplates;

  @OneToMany(() => ContestClaimPrize, (cp) => cp.contest_prizes)
  claim_prize: ContestClaimPrize[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
