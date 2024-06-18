import { TRUE_FALSE } from 'src/helper/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('timezones', { orderBy: { id: 'ASC' } })
export default class Timezone {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'timezone_value', type: 'varchar', default: null })
  timezone_value: string;

  @Column({ name: 'timezone_abbr', type: 'varchar', default: null })
  timezone_abbr: string;

  @Column({ name: 'offset', type: 'varchar', default: null })
  offset: string;

  @Column({
    name: 'dst',
    type: 'enum',
    enum: TRUE_FALSE,
    default: null,
  })
  dst: TRUE_FALSE;

  @Column({ name: 'timezone_text', type: 'varchar', default: null })
  timezone_text: string;

  @Column({ name: 'timezone_utc', type: 'varchar', default: null })
  timezone_utc: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
