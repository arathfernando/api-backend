import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import WorkspaceType from './workspace-type.entity';

@Entity('workspace_card_type', { orderBy: { id: 'ASC' } })
export default class WorkspaceCardType {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => WorkspaceType, (btc) => btc.workspace_card_type, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'workspace_type_id',
  })
  workspace_type: WorkspaceType;

  @Column({ name: 'order', type: 'int', default: null })
  order: number;

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
