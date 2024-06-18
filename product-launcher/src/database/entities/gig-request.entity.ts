import {
  GIG_REQUEST_RESPONSE_STATUS,
  GIG_REQUEST_STATE,
  GIG_REQUEST_STATUS,
} from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectGigPackage } from './gig-package.entity';
import { ProjectGigRequestResponse } from './gig-request-response.entity';
import { ProjectGig } from './gig.entity';

@Entity('project_gig_request')
export class ProjectGigRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @Column({ name: 'attachment', type: 'text', default: null })
  attachment: string;

  @Column({ name: 'budget_for_service', type: 'int', default: null })
  budget_for_service: number;

  @ManyToOne(() => ProjectGig, (pg) => pg.request, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_id',
    referencedColumnName: 'id',
  })
  gig: ProjectGig;

  @OneToMany(() => ProjectGigRequestResponse, (pgg) => pgg.request)
  request_response: ProjectGigRequestResponse[];

  @ManyToOne(() => ProjectGigPackage, (pg) => pg.request, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_package_id',
    referencedColumnName: 'id',
  })
  gig_package: ProjectGigPackage;

  @Column({
    name: 'status',
    type: 'enum',
    enum: GIG_REQUEST_STATUS,
    default: GIG_REQUEST_STATUS.PENDING,
  })
  status: GIG_REQUEST_STATUS;

  @Column({
    name: 'state',
    type: 'enum',
    enum: GIG_REQUEST_STATE,
    default: GIG_REQUEST_STATE.NEW,
  })
  state: GIG_REQUEST_STATE;

  @Column({
    name: 'request_response_status',
    type: 'enum',
    enum: GIG_REQUEST_RESPONSE_STATUS,
    default: GIG_REQUEST_RESPONSE_STATUS.NOT_SENT,
  })
  request_response_status: GIG_REQUEST_STATUS;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
