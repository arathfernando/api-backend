import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('partner_type', { orderBy: { id: 'ASC' } })
export default class PartnerType {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'type', type: 'varchar', default: null })
  type: string;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
