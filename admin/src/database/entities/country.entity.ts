import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('country', { orderBy: { id: 'ASC' } })
export default class Country {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'country_name', type: 'varchar', default: null })
  country_name: string;

  @Column({ name: 'short_name', type: 'text', default: null })
  short_name: string;

  @Column({ name: 'continent', type: 'text', default: null })
  continent: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
