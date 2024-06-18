import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import TranslationProjectLanguage from './translation-project-language.entity';
import TranslationProjectKey from './translation-project-key.entity';

@Entity('translation_project', { orderBy: { id: 'ASC' } })
export default class TranslationProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_name', type: 'varchar', default: null })
  project_name: string;

  @Column({ name: 'project_slug', type: 'varchar', default: null })
  project_slug: string;

  @OneToMany(() => TranslationProjectLanguage, (tl) => tl.translation_project)
  translation_project_language: TranslationProjectLanguage[];

  @OneToMany(() => TranslationProjectKey, (tl) => tl.translation_project)
  translation_project_key: TranslationProjectKey[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
