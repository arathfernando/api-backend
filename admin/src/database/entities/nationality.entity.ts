import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('nationality', { orderBy: { id: 'ASC' } })
export default class Nationality {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'nationality', type: 'varchar', default: null })
  nationality: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
