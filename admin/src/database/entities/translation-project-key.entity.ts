import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TranslationProjectValue from './translation-project-value.entity';
import TranslationProject from './translation-project.entity';

@Entity('translation_project_key', { orderBy: { id: 'ASC' } })
export default class TranslationProjectKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'translation_key',
    type: 'varchar',
    default: null,
  })
  translation_key: string;

  @Column({ name: 'namespace', type: 'varchar', default: null })
  namespace: string;

  @OneToMany(() => TranslationProjectValue, (tv) => tv.translation_project_key)
  translation_project_value: TranslationProjectValue[];

  @ManyToOne(() => TranslationProject, (tp) => tp.translation_project_key, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'translation_project_id',
  })
  translation_project: TranslationProject;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
