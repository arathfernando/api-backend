import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin_role', { orderBy: { id: 'ASC' } })
export default class AdminRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_name', type: 'text', default: null })
  role_name: string;

  @Column({ name: 'permission', type: 'text', default: null })
  permission: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
