import { INVITE_STATUS } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectGig } from './gig.entity';
import { Workspace } from './workspace.entity';

@Entity('workspace_expert')
export class WorkspaceExpert {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workspace, (pg) => pg.workspace_expert, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'workspace_id',
    referencedColumnName: 'id',
  })
  workspace: Workspace;

  @Column({
    name: 'invite_status',
    type: 'enum',
    enum: INVITE_STATUS,
    default: null,
  })
  invite_status: INVITE_STATUS;

  @ManyToOne(() => ProjectGig, (pg) => pg.workspace_expert, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_id',
    referencedColumnName: 'id',
  })
  gig: ProjectGig;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @Column({ name: 'invited_by', type: 'varchar', default: null })
  invited_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
