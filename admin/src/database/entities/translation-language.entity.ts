import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TranslationProjectLanguage from './translation-project-language.entity';

@Entity('translation_languages', { orderBy: { id: 'ASC' } })
export default class TranslationLanguages {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'language_code', type: 'varchar', default: null })
  language_code: string;

  @Column({ name: 'language_name', type: 'varchar', default: null })
  language_name: string;

  @Column({ name: 'flag', type: 'varchar', default: null })
  flag: string;

  @OneToMany(() => TranslationProjectLanguage, (tv) => tv.translation_language)
  translation_project_language: TranslationProjectLanguage[];

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
