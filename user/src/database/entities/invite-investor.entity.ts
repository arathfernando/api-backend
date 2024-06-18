import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('invite_investor', { orderBy: { id: 'ASC' } })
export class InviteInvestor {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'email', unique: true, default: null, type: 'varchar' })
  email: string;

  @Column({ name: 'invited_by', type: 'varchar', default: null })
  invited_by: number;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
