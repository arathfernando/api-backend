import { ATTENDEE_STATUS } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityEvent } from './community-event.entity';

@Entity('event_attendees')
export class EventAttendees {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'attendee', type: 'varchar', default: null })
  attendee: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ATTENDEE_STATUS,
    default: ATTENDEE_STATUS.PENDING,
  })
  status: ATTENDEE_STATUS;

  @ManyToOne(() => CommunityEvent, (ce) => ce.event_attendees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'event_id',
  })
  event: CommunityEvent;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
