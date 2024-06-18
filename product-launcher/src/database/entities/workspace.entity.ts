import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkspaceMembers } from './workspace-member.entity';
import { WorkspaceCards } from './workspace-cards.entity';
import { WorkspaceExpert } from './workspace-expert.entity';

@Entity('workspace')
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'project_id', type: 'int', default: null })
  project_id: number;

  @Column({ name: 'category_type', type: 'int', default: null })
  workspace_type: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @OneToMany(() => WorkspaceCards, (pgf) => pgf.workspace)
  workspace_cards: WorkspaceCards[];

  @OneToMany(() => WorkspaceExpert, (pgf) => pgf.workspace)
  workspace_expert: WorkspaceExpert[];

  @OneToMany(() => WorkspaceMembers, (pgf) => pgf.workspace)
  workspace_members: WorkspaceMembers[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
