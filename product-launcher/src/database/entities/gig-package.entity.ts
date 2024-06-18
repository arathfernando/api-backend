import { GIG_ACCEPT_PAYMENT } from 'src/core/constant/enum.constant';
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
import { ProjectGigRequest } from './gig-request.entity';
import { ProjectGig } from './gig.entity';
import { GigPayment } from './gig-payment.entity';

@Entity('project_gig_package')
export class ProjectGigPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'how_get_paid',
    type: 'enum',
    enum: GIG_ACCEPT_PAYMENT,
    default: null,
  })
  how_get_paid: GIG_ACCEPT_PAYMENT;

  @Column({ name: 'package_title', type: 'varchar', default: null })
  package_title: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'available_from', type: 'date', default: null })
  available_from: Date;

  @Column({ name: 'available_to', type: 'date', default: null })
  available_to: Date;

  @Column({ name: 'package_price', type: 'int', default: null })
  package_price: number;

  @OneToMany(() => ProjectGigRequest, (pgf) => pgf.gig)
  request: ProjectGigRequest[];

  @OneToMany(() => GigPayment, (pgf) => pgf.project_gig_package)
  gig_payment: GigPayment[];

  @ManyToOne(() => ProjectGig, (pg) => pg.packages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_id',
    referencedColumnName: 'id',
  })
  gig: ProjectGig;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
