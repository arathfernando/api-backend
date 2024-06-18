import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityEvent } from './community-event.entity';
import { EventLectureTiming } from './event-lecture.entity';

@Entity('event_timing')
export class EventTiming {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'start_date', type: 'varchar', default: null })
  start_date: string;

  @Column({ name: 'start_time', type: 'text', default: null })
  start_time: string;

  @Column({ name: 'end_time', type: 'text', default: null })
  end_time: string;

  @ManyToOne(() => CommunityEvent, (ce) => ce.event_timing, {
    onDelete: 'CASCADE',
  })
  event: CommunityEvent;

  @OneToMany(() => EventLectureTiming, (ce) => ce.event_timing, {
    onDelete: 'CASCADE',
  })
  event_lecture_timing: EventLectureTiming;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
