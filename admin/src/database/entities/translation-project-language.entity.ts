import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TRUE_FALSE } from 'src/helper/constant';
import TranslationProject from './translation-project.entity';
import TranslationProjectValue from './translation-project-value.entity';
import TranslationLanguages from './translation-language.entity';

@Entity('translation_project_language', { orderBy: { id: 'ASC' } })
export default class TranslationProjectLanguage {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(
    () => TranslationProject,
    (tp) => tp.translation_project_language,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'translation_project_id',
  })
  translation_project: TranslationProject;

  @OneToMany(
    () => TranslationProjectValue,
    (tv) => tv.translation_project_language,
  )
  translation_project_value: TranslationProjectValue[];

  @ManyToOne(
    () => TranslationLanguages,
    (tp) => tp.translation_project_language,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'translation_language_id',
  })
  translation_language: TranslationLanguages;

  @Column({
    name: 'is_default',
    type: 'enum',
    enum: TRUE_FALSE,
    default: null,
  })
  is_default: TRUE_FALSE;
}
