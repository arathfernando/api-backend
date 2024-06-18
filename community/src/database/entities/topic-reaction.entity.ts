import { REACTION_TYPE } from 'src/core/constant/enum.constant';
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

@Entity('topic_reaction')
export class TopicReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'reaction',
    type: 'enum',
    enum: REACTION_TYPE,
    default: null,
  })
  reaction: REACTION_TYPE;

  @ManyToOne(() => CommunityTopic, (ct) => ct.topic_reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'topic_id',
    referencedColumnName: 'id',
  })
  topic: CommunityTopic;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
