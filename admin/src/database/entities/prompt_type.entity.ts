import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Prompt from './prompt.entity';

@Entity('prompt_type', { orderBy: { id: 'ASC' } })
export default class PromptType {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'media', type: 'text', default: null, array: true })
  variable_names: string[];

  @OneToMany(() => Prompt, (lang) => lang.prompt_type)
  prompt: Prompt[];

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
