import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityGroup } from './community-group.entity';

@Entity('group_activity')
export class GroupActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityGroup, (c) => c.group_activity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: CommunityGroup;

  @Column({ name: 'user_id', default: null })
  user_id: number;

  @Column({ name: 'activity', type: 'text', default: null })
  activity: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
