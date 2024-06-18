import {
  FOLLOW_REACTION_TYPE,
  TOPIC_TYPE,
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
import { CommunityTopic } from './community-topic.entity';

@Entity('topic_follow')
export class TopicFollow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'topic_type',
    type: 'enum',
    enum: TOPIC_TYPE,
    default: null,
  })
  topic_type: TOPIC_TYPE;

  @Column({
    name: 'reaction',
    type: 'enum',
    enum: FOLLOW_REACTION_TYPE,
    default: null,
  })
  reaction_type: FOLLOW_REACTION_TYPE;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @ManyToOne(() => CommunityTopic, (ct) => ct.follows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'topic_id',
  })
  community_topic: CommunityTopic;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
