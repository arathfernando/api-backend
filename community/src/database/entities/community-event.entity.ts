import {
  EVENT_STATUS,
  EVENT_TYPE,
  YES_NO,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventAttendees } from './event-attendees.entity';
import { EventLectureTiming } from './event-lecture.entity';
import { EventSpeaker } from './event-speaker.entity';
import { EventTiming } from './event-timing.entity';

@Entity('community_event')
export class CommunityEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  cover_image: string;

  @Column({ name: 'event_title', type: 'varchar', default: null })
  event_title: string;

  @Column({ name: 'intro', type: 'varchar', default: null })
  intro: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: EVENT_TYPE,
    default: null,
  })
  event_type: EVENT_TYPE;

  @Column({ name: 'event_webpage', type: 'text', default: null })
  event_webpage: string;

  @Column({ name: 'goals', type: 'int', default: null, array: true })
  goals: number[];

  @Column({
    name: 'online_event',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  online_event: YES_NO;

  @Column({ name: 'meeting_link', type: 'text', default: null })
  meeting_link: string;

  @Column({ name: 'address', type: 'text', default: null })
  address: string;

  @Column({ name: 'city', type: 'text', default: null })
  city: string;

  @Column({ name: 'map_link', type: 'text', default: null })
  map_link: string;

  @Column({
    name: 'unlimited_seats',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  unlimited_seats: YES_NO;

  @Column({ name: 'no_of_seats', type: 'int', default: null })
  no_of_seats: number;

  @Column({
    name: 'single_day_event',
    type: 'enum',
    enum: YES_NO,
    default: null,
  })
  single_day_event: YES_NO;

  @OneToMany(() => EventTiming, (et) => et.event)
  event_timing: EventTiming[];

  @OneToMany(() => EventLectureTiming, (et) => et.event)
  event_lecture_timing: EventLectureTiming[];

  @OneToMany(() => EventSpeaker, (es) => es.event)
  event_speakers: EventSpeaker[];

  @OneToMany(() => EventAttendees, (ea) => ea.event)
  event_attendees: EventAttendees[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: EVENT_STATUS,
    default: null,
  })
  status: EVENT_STATUS;

  @Column({ name: 'tags', type: 'varchar', default: null })
  tags: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
