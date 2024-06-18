import { MERGE_ACCOUNT_STATUS } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('merge_account', { orderBy: { id: 'ASC' } })
export class MergeAccount {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'current_user_id', type: 'int', default: null })
  current_user_id: number;

  @Column({ name: 'merge_user_id', type: 'int', default: null })
  merge_user_id: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MERGE_ACCOUNT_STATUS,
    default: MERGE_ACCOUNT_STATUS.PENDING,
  })
  status: MERGE_ACCOUNT_STATUS;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
