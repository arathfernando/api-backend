import { GIG_STATUS } from 'src/core/constant/enum.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectGigRequest } from './gig-request.entity';
import { ProjectGigCategory } from './gig-category.entity';
import { ProjectGigFaq } from './gig-faq.entity';
import { ProjectGigFeedback } from './gig-feedback.entity';
import { ProjectGigGallery } from './gig-gallery.entity';
import { ProjectGigPackage } from './gig-package.entity';
import { ProjectGigReaction } from './gig-reaction.entity';
import { WorkspaceExpert } from './workspace-expert.entity';
import { GigPayment } from './gig-payment.entity';

@Entity('project_gig')
export class ProjectGig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'expertise_title', type: 'varchar', default: null })
  expertise_title: string;

  @Column({ name: 'slug', type: 'varchar', default: null })
  slug: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @ManyToMany(() => ProjectGigCategory, (pgc) => pgc.gigs, {
    onDelete: 'CASCADE',
  })
  categories: ProjectGigCategory[];

  @Column({ name: 'tags', type: 'int', array: true, default: null })
  tags: number[];

  @Column({
    name: 'gig_status',
    type: 'enum',
    enum: GIG_STATUS,
    default: GIG_STATUS.PENDING,
  })
  gig_status: GIG_STATUS;

  @OneToMany(() => WorkspaceExpert, (pgf) => pgf.gig)
  workspace_expert: WorkspaceExpert[];

  @OneToMany(() => ProjectGigPackage, (pgp) => pgp.gig)
  packages: ProjectGigPackage[];

  @OneToMany(() => ProjectGigFaq, (pgf) => pgf.gig)
  faqs: ProjectGigFaq[];

  @OneToMany(() => ProjectGigRequest, (pgf) => pgf.gig)
  request: ProjectGigRequest[];

  @OneToMany(() => ProjectGigGallery, (pgg) => pgg.gig)
  gallery_images: ProjectGigGallery[];

  @OneToMany(() => ProjectGigFeedback, (pgg) => pgg.gig)
  feedbacks: ProjectGigFeedback[];

  @OneToMany(() => ProjectGigReaction, (pgg) => pgg.gig)
  reaction: ProjectGigReaction[];

  @OneToMany(() => GigPayment, (pgg) => pgg.project_gig)
  gig_payment: GigPayment[];

  @Column({ name: 'workspace_id', type: 'varchar', default: null })
  workspace_id: number;

  @Column({ name: 'product_category', type: 'varchar', default: null })
  product_category: number;

  @Column({ name: 'product_sub_category', type: 'varchar', default: null })
  product_sub_category: number;

  @Column({ name: 'product_sub_faq', type: 'varchar', default: null })
  product_sub_faq: number;

  @Column({ name: 'created_by', type: 'varchar', default: null })
  created_by: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
