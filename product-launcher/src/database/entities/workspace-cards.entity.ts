import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('workspace_cards')
export class WorkspaceCards {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'background_color', type: 'text', default: null })
  background_color: string;

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @ManyToOne(() => Workspace, (pg) => pg.workspace_cards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'workspace_id',
    referencedColumnName: 'id',
  })
  workspace: Workspace;

  @Column({ name: 'workspace_card_type', type: 'int', default: null })
  workspace_card_type: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
