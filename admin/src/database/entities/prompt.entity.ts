import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import PromptType from './prompt_type.entity';

@Entity('prompt', { orderBy: { id: 'ASC' } })
export default class Prompt {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'prompt_text', type: 'varchar', default: null })
  prompt_text: string;

  @ManyToOne(() => PromptType, (a) => a.prompt)
  @JoinColumn({
    name: 'prompt_type',
  })
  prompt_type: PromptType;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
