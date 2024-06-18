import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from '.';
import { CONVERSATION_TYPE } from 'src/core/constant/enum.constant';

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { array: true })
  members: number[];

  @Column({ name: 'members_name', type: 'text', default: null })
  members_name: string;

  @Column({ name: 'conversation_name', type: 'text', default: null })
  conversation_name: string;

  @OneToMany(() => Chat, (message) => message.conversation, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  messages: Chat[];

  @Column({
    name: 'seen_unseen',
    type: 'enum',
    enum: CONVERSATION_TYPE,
    default: CONVERSATION_TYPE.NORMAL,
  })
  conversation_type: CONVERSATION_TYPE;

  @Column({ name: 'gig_id', type: 'int', default: 0 })
  gig_id: number;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @ManyToOne(() => Chat, (message) => message.conversation)
  @JoinColumn({ name: 'last_message_sent' })
  last_message_sent: Chat;

  @CreateDateColumn({ name: 'created_at' })
  created_at: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: number;
}
