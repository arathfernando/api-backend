import { REPORT_TYPE } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_expertise_report')
export class UserExpertiseReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column({
    name: 'report_type',
    type: 'enum',
    enum: REPORT_TYPE,
    default: null,
  })
  report_type: REPORT_TYPE;

  @Column({
    nullable: true,
  })
  content_url: string;

  @Column({ name: 'proof_of_your_copyright', type: 'text', default: null })
  proof_of_your_copyright: string;

  @Column({ name: 'file_description', type: 'text', default: null })
  description: string;

  @Column({ name: 'user_id', type: 'varchar', default: null })
  user_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
