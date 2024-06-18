import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import TranslationProjectLanguage from './translation-project-language.entity';
import TranslationProjectKey from './translation-project-key.entity';

@Entity('translation_project_value', { orderBy: { id: 'ASC' } })
export default class TranslationProjectValue {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'translation_value', type: 'varchar', default: null })
  translation_value: string;

  @ManyToOne(
    () => TranslationProjectKey,
    (tk) => tk.translation_project_value,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'translation_key_id',
  })
  translation_project_key: TranslationProjectKey;

  @ManyToOne(
    () => TranslationProjectLanguage,
    (tl) => tl.translation_project_value,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'translation_project_language_id',
  })
  translation_project_language: TranslationProjectLanguage;
}
