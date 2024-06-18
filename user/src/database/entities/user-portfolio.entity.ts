import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './';
import { CONTENT_TYPE, PORTFOLIO_TYPE } from 'src/helper/constant';

@Entity('user_portfolio', { orderBy: { id: 'ASC' } })
export class UserPortfolio {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'skills', type: 'varchar', default: null, array: true })
  skills: number[];

  @Column({ name: 'title', type: 'text', default: null })
  title: string;

  @Column({ name: 'website_link', type: 'text', default: null })
  website_link: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'attachments', type: 'text', default: null, array: true })
  attachments: string[];

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: CONTENT_TYPE,
    default: null,
  })
  content_type: CONTENT_TYPE;

  @Column({
    name: 'portfolio_type',
    type: 'enum',
    enum: PORTFOLIO_TYPE,
    default: null,
  })
  portfolio_type: PORTFOLIO_TYPE;

  @ManyToOne(() => User, (user) => user.user_portfolio, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
