import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('social', { orderBy: { id: 'ASC' } })
export default class Social {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', default: null })
  name: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @Column({ name: 'logo', type: 'text', default: null })
  logo: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
