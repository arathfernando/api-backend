import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityGroup } from './community-group.entity';

@Entity('group_report', { orderBy: { id: 'ASC' } })
export class GroupReport {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'reason', type: 'varchar', default: null })
  reason: string;

  @Column({ name: 'response', type: 'varchar', default: null })
  response: string;

  @ManyToOne(() => CommunityGroup, (c) => c.group_reports, {
    onDelete: 'CASCADE',
  })
  group: CommunityGroup;

  @Column()
  user_id: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
