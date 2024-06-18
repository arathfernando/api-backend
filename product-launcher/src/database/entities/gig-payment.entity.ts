import {
  PRICING_TYPE,
  PRICING_CURRENCY,
} from 'src/core/constant/enum.constant';
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
import { ProjectGigPackage } from './gig-package.entity';

@Entity('gig_payment')
export class GigPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'pricing_currency',
    type: 'enum',
    enum: PRICING_CURRENCY,
    default: null,
  })
  pricing_currency: PRICING_CURRENCY;

  @Column({
    name: 'pricing_type',
    type: 'enum',
    enum: PRICING_TYPE,
    default: null,
  })
  pricing_type: PRICING_TYPE;

  @Column({ name: 'pricing', type: 'int', default: null })
  pricing: number;

  @Column({ name: 'installment', type: 'int', default: null })
  installment: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @ManyToOne(() => ProjectGig, (course_basic) => course_basic.gig_payment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'gig_id',
    referencedColumnName: 'id',
  })
  project_gig: ProjectGig;

  @ManyToOne(
    () => ProjectGigPackage,
    (course_basic) => course_basic.gig_payment,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'gig_package_id',
    referencedColumnName: 'id',
  })
  project_gig_package: ProjectGigPackage;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
