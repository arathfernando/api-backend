import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('grab_share', { orderBy: { id: 'ASC' } })
export default class GrabShare {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'text', default: null })
  name: string;

  @Column({ name: 'email', type: 'text', default: null })
  email: string;

  @Column({ name: 'message', type: 'text', default: null })
  message: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
