import { CANVAS_MEMBER_STATUS } from 'src/core/constant/enum.constant';
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

@Entity('workspace_members')
export class WorkspaceMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workspace, (pg) => pg.workspace_cards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'workspace_id',
    referencedColumnName: 'id',
  })
  workspace: Workspace;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CANVAS_MEMBER_STATUS,
    default: null,
  })
  status: CANVAS_MEMBER_STATUS;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: string;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
