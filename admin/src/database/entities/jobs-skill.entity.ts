import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('job_skill', { orderBy: { id: 'ASC' } })
export default class JobsSkill {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'skill', type: 'varchar', default: null })
  skill: string;

  @Column({ name: 'created_by', type: 'int', default: null })
  created_by: number;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
