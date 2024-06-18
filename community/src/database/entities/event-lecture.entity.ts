import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityEvent } from './community-event.entity';
import { EventSpeaker } from './event-speaker.entity';
import { EventTiming } from './event-timing.entity';

@Entity('event_lecture_timing')
export class EventLectureTiming {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'start_time', type: 'text', default: null })
  start_time: string;

  @Column({ name: 'end_time', type: 'text', default: null })
  end_time: string;

  @Column({
    nullable: true,
  })
  cover: string;

  @Column({
    nullable: true,
  })
  title: string;

  @Column({
    nullable: true,
  })
  location: string;

  @Column({
    nullable: true,
  })
  description: string;

  @ManyToOne(() => EventTiming, (ce) => ce.event_lecture_timing, {
    onDelete: 'CASCADE',
  })
  event_timing: EventTiming;

  @ManyToOne(() => EventSpeaker, (ce) => ce.event_lecture_timing, {
    onDelete: 'CASCADE',
  })
  event_speakers: EventSpeaker;

  @ManyToOne(() => CommunityEvent, (ce) => ce.event_lecture_timing, {
    onDelete: 'CASCADE',
  })
  event: CommunityEvent;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
