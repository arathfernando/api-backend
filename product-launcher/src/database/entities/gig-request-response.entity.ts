import { GIG_RESPONSE_STATUS } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectGigRequest } from './gig-request.entity';

@Entity('project_gig_request_response')
export class ProjectGigRequestResponse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'link_attached', type: 'text', default: null })
  link_attached: string;

  @Column({ name: 'attachment', type: 'text', default: null, array: true })
  attachments: string[];

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @Column({ name: 'reply_with_message', type: 'text', default: null })
  reply_with_message: string;

  @ManyToOne(() => ProjectGigRequest, (pg) => pg.request_response, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_request_id',
    referencedColumnName: 'id',
  })
  request: ProjectGigRequest;

  @Column({
    name: 'response_status',
    type: 'enum',
    enum: GIG_RESPONSE_STATUS,
    default: GIG_RESPONSE_STATUS.PENDING,
  })
  response_status: GIG_RESPONSE_STATUS;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
