import {
  COMMUNITY_REQUEST_STATUS,
  COMMUNITY_REQUEST_TYPE,
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

@Entity('community_request')
export class CommunityRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'community_request_type',
    type: 'enum',
    enum: COMMUNITY_REQUEST_TYPE,
    default: null,
  })
  community_request_type: COMMUNITY_REQUEST_TYPE;

  @Column({
    name: 'community_request_status',
    type: 'enum',
    enum: COMMUNITY_REQUEST_STATUS,
    default: COMMUNITY_REQUEST_STATUS.PENDING,
  })
  community_request_status: COMMUNITY_REQUEST_STATUS;

  @Column({ name: 'request_reference_id', type: 'varchar', default: null })
  request_reference_id: number;

  @Column({ name: 'reason', type: 'varchar', default: null })
  reason_of_the_rejection: string;

  @Column({ name: 'feedback', type: 'varchar', default: null })
  feedback: string;

  @ManyToOne(() => Community, (ct) => ct.community_request, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'community_id',
  })
  community: Community;

  @Column({ default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
