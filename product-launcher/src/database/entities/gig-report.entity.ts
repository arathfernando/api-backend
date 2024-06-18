import { GIG_REPORT_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gig_report')
export class GigReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'report_type',
    type: 'enum',
    enum: GIG_REPORT_TYPE,
    default: null,
  })
  report_type: GIG_REPORT_TYPE;

  @Column({
    nullable: true,
  })
  content_url: string;

  @Column({ name: 'proof_of_your_copyright', type: 'text', default: null })
  proof_of_your_copyright: string;

  @Column({ name: 'file_description', type: 'text', default: null })
  description: string;

  @Column({ name: 'gig_id', type: 'varchar', default: null })
  gig_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
