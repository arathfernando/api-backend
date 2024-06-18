import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './';

@Entity('close_account', { orderBy: { id: 'ASC' } })
export class CloseAccount {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'reason', type: 'varchar', default: null })
  reason: string;

  @Column({ name: 'feedback', type: 'varchar', default: null })
  feedback: string;

  @OneToOne(() => User, (user) => user.general_profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user_id: User;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
