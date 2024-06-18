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

@Entity('group_rules')
export class GroupRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rule', type: 'varchar', default: null })
  rule: string;

  @ManyToOne(() => CommunityGroup, (cg) => cg.group_rules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_id',
  })
  community_group: CommunityGroup;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
