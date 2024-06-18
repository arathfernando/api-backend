import { SHARED_CONTENT_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comments } from './comments.entity';
import { CommunityTopic } from './community-topic.entity';
import { Community } from './community.entity';

@Entity('shared_posts')
export class SharedPosts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'content', type: 'text', default: null })
  content: string;

  @Column({ name: 'shared_content_id', type: 'text', default: null })
  shared_content_id: number;

  @Column({
    name: 'shared_content_type',
    type: 'enum',
    enum: SHARED_CONTENT_TYPE,
    default: null,
  })
  shared_content_type: SHARED_CONTENT_TYPE;

  @ManyToMany(() => CommunityTopic, (ct) => ct.posts, {
    onDelete: 'CASCADE',
  })
  topics: CommunityTopic[];

  @ManyToOne(() => Community, (c) => c.posts, {
    onDelete: 'CASCADE',
  })
  community: Community;

  @OneToMany(() => Comments, (comments) => comments.post)
  comments: Comments[];

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
