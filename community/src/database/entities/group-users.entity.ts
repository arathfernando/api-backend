import {
  GROUP_INVITE_STATUS,
  GROUP_USER_ROLE,
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
import { CommunityGroup } from './community-group.entity';

@Entity('group_users')
export class GroupUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityGroup, (cg) => cg.group_users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_id',
  })
  group: CommunityGroup;

  @Column({
    default: null,
  })
  user_id: number;

  @Column({
    default: null,
  })
  invited_by: number;

  @Column({
    name: 'role',
    type: 'enum',
    enum: GROUP_USER_ROLE,
    default: null,
  })
  role: GROUP_USER_ROLE;

  @Column({
    name: 'invite_status',
    type: 'enum',
    enum: GROUP_INVITE_STATUS,
    default: null,
  })
  invite_status: GROUP_INVITE_STATUS;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
