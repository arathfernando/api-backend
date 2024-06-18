import { SEEN_UNSEEN } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender', type: 'int', default: null })
  sender: number;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @Column({
    name: 'seen_unseen',
    type: 'enum',
    enum: SEEN_UNSEEN,
    default: SEEN_UNSEEN.DELIVER,
  })
  seen_unseen: SEEN_UNSEEN;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'conversation_id',
    referencedColumnName: 'id',
  })
  conversation: Conversation;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
