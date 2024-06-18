import {
  CLIME_PRIZE_STATUS,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContestPrize } from './contest-prize.entity';

@Entity('contest_claim_prize')
export class ContestClaimPrize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CLIME_PRIZE_STATUS,
    default: CLIME_PRIZE_STATUS.CLAIMED,
  })
  status: CLIME_PRIZE_STATUS;

  @Column({
    name: 'is_claimed',
    type: 'enum',
    enum: TRUE_FALSE,
    default: TRUE_FALSE.FALSE,
  })
  is_claimed: TRUE_FALSE;

  @ManyToOne(() => ContestPrize, (cp) => cp.claim_prize, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'contest_prizes_id',
  })
  contest_prizes: ContestPrize;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
