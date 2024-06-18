import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeneralProfile } from './';

@Entity('social_media', { orderBy: { id: 'ASC' } })
export class SocialMedia {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'social_media_id', type: 'int', default: null })
  social_media_id: number;

  @Column({ name: 'link', type: 'varchar', default: null })
  link: string;

  @ManyToOne(
    () => GeneralProfile,
    (general_profile) => general_profile.social_media,
    {
      onDelete: 'CASCADE',
    },
  )
  general_profile: GeneralProfile;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;
}
