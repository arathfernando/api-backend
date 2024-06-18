import {
  COMMUNITY_INVITE_STATUS,
  COMMUNITY_USER_ROLE,
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
import { Community } from './community.entity';

@Entity('community_user')
export class CommunityUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: null,
  })
  user_id: number;

  @Column({
    default: null,
  })
  email: string;

  @Column({
    default: null,
  })
  invited_by: number;

  @Column({
    name: 'role',
    type: 'enum',
    enum: COMMUNITY_USER_ROLE,
    default: null,
  })
  role: COMMUNITY_USER_ROLE;

  @Column({
    name: 'invite_status',
    type: 'enum',
    enum: COMMUNITY_INVITE_STATUS,
    default: null,
  })
  invite_status: COMMUNITY_INVITE_STATUS;

  @ManyToOne(() => Community, (c) => c.community_users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'community_id',
  })
  community: Community;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
