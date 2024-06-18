import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('article', { orderBy: { id: 'ASC' } })
export default class Article {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'article_title', type: 'varchar', default: null })
  article_title: string;

  @Column({ name: 'article_description', type: 'varchar', default: null })
  article_description: string;

  @Column({ name: 'image', type: 'varchar', default: null })
  image: string;

  @Column({ nullable: false, type: 'int', default: null })
  created_by: number;

  @CreateDateColumn({ name: 'created_at', select: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
