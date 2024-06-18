import { WORKSPACE_CATEGORY_LABEL } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import WorkspaceCardType from './workspace-card-type.entity';

@Entity('workspace_type', { orderBy: { id: 'ASC' } })
export default class WorkspaceType {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'title', type: 'varchar', default: null })
  title: string;

  @OneToMany(() => WorkspaceCardType, (bt) => bt.workspace_type)
  workspace_card_type: WorkspaceCardType[];

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'short_description', type: 'text', default: null })
  short_description: string;

  @Column({
    name: 'label',
    type: 'enum',
    enum: WORKSPACE_CATEGORY_LABEL,
    default: null,
  })
  label: WORKSPACE_CATEGORY_LABEL;

  @Column({ name: 'co_created_with', type: 'text', default: null })
  co_created_with: string;

  @Column({ name: 'icon', type: 'text', default: null })
  icon: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: true })
  updatedAt: Date;
}
