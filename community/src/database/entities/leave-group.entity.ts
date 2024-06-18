import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leave_group', { orderBy: { id: 'ASC' } })
export class LeaveGroup {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'reason', type: 'varchar', default: null })
  reason: string;

  @Column()
  group_id: number;

  @Column()
  user_id: number;

  @Column({ default: null })
  removed_by: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
