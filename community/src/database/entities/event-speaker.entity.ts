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

@Entity('event_speaker')
export class EventSpeaker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'role', type: 'varchar', default: null })
  role: string;

  @Column({ name: 'bio', type: 'text', default: null })
  bio: string;

  @Column({
    nullable: true,
  })
  cover: string;

  @ManyToOne(() => CommunityEvent, (ce) => ce.event_speakers, {
    onDelete: 'CASCADE',
  })
  event: CommunityEvent;

  @OneToMany(() => EventLectureTiming, (ce) => ce.event_speakers, {
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
