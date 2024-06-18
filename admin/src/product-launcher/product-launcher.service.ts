import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import InnovationCategory from 'src/database/entities/innovation-category.entity';
import ProductCategory from 'src/database/entities/product-category.entity';
import { ProductSubCategoryFaq } from 'src/database/entities/product-subcategory-faq.entity';
import ProductSubCategory from 'src/database/entities/product-subcategory.entity';
import TechCategory from 'src/database/entities/tech-category.entity';
import { UPDATE_ORDER } from 'src/helper/constant';
import {} from 'src/helper/dtos';
import { InnovationCategoryDto } from 'src/helper/dtos/innovation-category.dto';
import { ProductCategoryDto } from 'src/helper/dtos/product-category.dto';
import { ProductSubCategoryfaqDto } from 'src/helper/dtos/product-subcategory-faq.dto';
import { ProductSubCategoryDto } from 'src/helper/dtos/product-subcategory.dto';
import { AssessmentDto } from 'src/helper/dtos/project-assessment.dto';
import {
  CreateProjectBasicDTO,
  UpdateProjectBasicDTO,
} from 'src/helper/dtos/project-basic.dto';
import { ProjectMemberDto } from 'src/helper/dtos/project-member.dto';
import { UpdateOrderDTO } from 'src/helper/dtos/update-order.dto';
import { S3Service } from 'src/helper/services/s3/s3.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class ProductLauncherService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PRODUCT_LAUNCHER')
    private readonly productLauncherClient: ClientProxy,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductSubCategory)
    private readonly productSubCategoryRepository: Repository<ProductSubCategory>,
    @InjectRepository(InnovationCategory)
    private readonly innovationCategoryRepository: Repository<InnovationCategory>,
    @InjectRepository(TechCategory)
    private readonly techCategoryRepository: Repository<TechCategory>,
    @InjectRepository(ProductSubCategoryFaq)
    private readonly productSubCategoryFaqRepository: Repository<ProductSubCategoryFaq>,
    private readonly s3Service: S3Service,
  ) {}

  async deleteAndReorderCategory(id: number): Promise<any> {
    const itemToDelete = await this.productCategoryRepository.findOne({
      where: {
        id: id,
      },
    });
    await this.productCategoryRepository.delete(id);

    const itemsToUpdate = await this.productCategoryRepository
      .createQueryBuilder('e')
      .where('e.order > :order', { order: itemToDelete.order })
      .getMany();

    for (const item of itemsToUpdate) {
      item.order--;
    }
    await this.productCategoryRepository.save(itemsToUpdate);
  }
  async saveWithOrderCategory(data: any): Promise<any> {
    const maxOrder = await this.productCategoryRepository.query(
      `SELECT MAX(psf.order) AS max_order FROM product_category AS psf;`,
    );
    data.order = maxOrder[0].max_order + 1;
    return await this.productCategoryRepository.save(data);
  }

  async deleteAndReorderSubCategory(id: number): Promise<any> {
    const itemToDelete = await this.productSubCategoryRepository.findOne({
      where: {
        id: id,
      },
      relations: ['product_category'],
    });
    await this.productSubCategoryRepository.delete(id);

    const itemsToUpdate = await this.productSubCategoryRepository
      .createQueryBuilder('e')
      .where('e.order > :order', { order: itemToDelete.order })
      .andWhere('e.product_category_id = :category_id', {
        category_id: itemToDelete.product_category.id,
      })
      .getMany();

    for (const item of itemsToUpdate) {
      item.order--;
    }
    await this.productSubCategoryRepository.save(itemsToUpdate);
  }
  async saveWithOrderSubCategory(data: any): Promise<any> {
    const maxOrder = await this.productSubCategoryRepository.query(
      `SELECT MAX(psf.order) AS max_order FROM product_subcategory AS psf WHERE product_category_id = ${data.product_category.id};`,
    );
    data.order = maxOrder[0].max_order + 1;
    return await this.productSubCategoryRepository.save(data);
  }

  async deleteAndReorderSubCategoryFaq(id: number): Promise<any> {
    const itemToDelete = await this.productSubCategoryFaqRepository.findOne({
      where: {
        id: id,
      },
      relations: ['product_subcategory'],
    });
    await this.productSubCategoryFaqRepository.delete(id);

    const itemsToUpdate = await this.productSubCategoryFaqRepository
      .createQueryBuilder('e')
      .where('e.order > :order', { order: itemToDelete.order })
      .andWhere('e.product_subcategory_id = :category_id', {
        category_id: itemToDelete.product_subcategory.id,
      })
      .getMany();

    for (const item of itemsToUpdate) {
      item.order--;
    }
    await this.productSubCategoryFaqRepository.save(itemsToUpdate);
  }
  async saveWithOrderSubCategoryFaq(data: any): Promise<any> {
    const maxOrder = await this.productSubCategoryFaqRepository.query(
      `SELECT MAX(psf.order) AS max_order FROM product_subcategory_faq AS psf WHERE product_subcategory_id = ${data.product_subcategory.id};`,
    );
    data.order = maxOrder[0].max_order + 1;
    return await this.productSubCategoryFaqRepository.save(data);
  }
  async createProductCategory(
    data: ProductCategoryDto,
    user_id: number,
    logo: any,
  ): Promise<any> {
    try {
      let cover;
      if (logo) {
        cover = await this.s3Service.uploadFile(logo);
      }
      const create = new ProductCategory();
      create.name = data.name;
      create.description = data.description;
      create.created_by = user_id;
      create.cover = cover.Location;

      await this.saveWithOrderCategory(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProductCategory(id: number, data: any, logo: any): Promise<any> {
    try {
      const productCategory = await this.productCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!productCategory) {
        return {
          status: 500,
          message: 'No Product Category found.',
        };
      }
      let cover;
      if (logo) {
        cover = await this.s3Service.uploadFile(logo);
        data.cover = cover.Location;
      }
      await this.productCategoryRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProductCategoryById(id: number): Promise<any> {
    try {
      const productCategory = await this.productCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!productCategory) {
        return {
          status: 500,
          message: 'No Product Category found.',
        };
      }
      return productCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSubCategoryById(id: number): Promise<any> {
    try {
      const productCategory = await this.productSubCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!productCategory) {
        return {
          status: 500,
          message: 'No Product Category found.',
        };
      }
      return productCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllProductCategory(data: any): Promise<any> {
    try {
      const productCategory = await this.productCategoryRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });
      if (!productCategory.length) {
        return {
          status: 500,
          message: 'No productCategory found.',
        };
      }
      return productCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProductCategory(id: number): Promise<any> {
    try {
      const productCategory = await this.productCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!productCategory) {
        return {
          status: 500,
          message: 'No Product Category found.',
        };
      }

      await this.deleteAndReorderCategory(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createProductSubCategory(
    data: ProductSubCategoryDto,
    user_id: number,
    logo: any,
  ): Promise<any> {
    try {
      const productCategory = await this.productCategoryRepository.findOne({
        where: {
          id: data.product_category_id,
        },
      });

      if (!productCategory) {
        return {
          status: 500,
          message: 'No product category found.',
        };
      }
      let cover;

      if (logo) {
        cover = await this.s3Service.uploadFile(logo);
      }

      const create = new ProductSubCategory();
      create.name = data.name;
      create.description = data.description;
      create.created_by = user_id;
      create.product_category = productCategory;
      create.cover = cover.Location;

      await this.saveWithOrderSubCategory(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProductSubCategory(
    id: number,
    data: any,
    logo: any,
  ): Promise<any> {
    try {
      const productSubCategory =
        await this.productSubCategoryRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!productSubCategory) {
        return {
          status: 500,
          message: 'No Product Subcategory found.',
        };
      }
      let cover;
      if (logo) {
        cover = await this.s3Service.uploadFile(logo);
        data.cover = cover.Location;
      }
      if (data.product_category_id) {
        const productCategory = await this.productCategoryRepository.findOne({
          where: {
            id: data.product_category_id,
          },
        });
        if (!productSubCategory) {
          return {
            status: 500,
            message: 'No Product Subcategory found.',
          };
        }
        data.product_category = productCategory;
        delete data.product_category_id;
      }
      await this.productSubCategoryRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProductSubCategoryById(id: number): Promise<any> {
    try {
      const productSubCategory =
        await this.productSubCategoryRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!productSubCategory) {
        return {
          status: 500,
          message: 'No Product Subcategory found.',
        };
      }
      return productSubCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllProductSubCategory(data: any): Promise<any> {
    try {
      const productSubCategory = await this.productSubCategoryRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
        relations: ['product_category'],
      });
      if (!productSubCategory.length) {
        return {
          status: 500,
          message: 'No productSubCategory found.',
        };
      }
      return productSubCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProductSubCategory(id: number): Promise<any> {
    try {
      const productSubCategory =
        await this.productSubCategoryRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!productSubCategory) {
        return {
          status: 500,
          message: 'No Product Subcategory found.',
        };
      }

      await this.deleteAndReorderSubCategory(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createInnovationCategory(
    data: InnovationCategoryDto,
    user_id: number,
  ): Promise<any> {
    try {
      const create = new InnovationCategory();
      create.name = data.name;
      create.description = data.description;
      create.created_by = user_id;

      await this.innovationCategoryRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateInnovationCategory(id: number, data: any): Promise<any> {
    try {
      const innovationCategory =
        await this.innovationCategoryRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!innovationCategory) {
        return {
          status: 500,
          message: 'No Innovation Category found.',
        };
      }

      await this.innovationCategoryRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getInnovationCategoryById(id: number): Promise<any> {
    try {
      const innovationCategory =
        await this.innovationCategoryRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!innovationCategory) {
        return {
          status: 500,
          message: 'No Innovation Category found.',
        };
      }
      return innovationCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllInnovationCategory(data: any): Promise<any> {
    try {
      const innovationCategory = await this.innovationCategoryRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });
      if (!innovationCategory.length) {
        return {
          status: 500,
          message: 'No Innovation Category found.',
        };
      }
      return innovationCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteInnovationCategory(id: number): Promise<any> {
    try {
      const innovationCategory =
        await this.innovationCategoryRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!innovationCategory) {
        return {
          status: 500,
          message: 'No Innovation Category found.',
        };
      }

      await this.innovationCategoryRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createTechCategory(
    data: InnovationCategoryDto,
    user_id: number,
  ): Promise<any> {
    try {
      const create = new TechCategory();
      create.name = data.name;
      create.description = data.description;
      create.created_by = user_id;
      await this.techCategoryRepository.save(create);
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateTechCategory(id: number, data: any): Promise<any> {
    try {
      const techCategory = await this.techCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!techCategory) {
        return {
          status: 500,
          message: 'No Tech Category found.',
        };
      }

      await this.techCategoryRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTechCategoryById(id: number): Promise<any> {
    try {
      const techCategory = await this.techCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!techCategory) {
        return {
          status: 500,
          message: 'No Tech Category found.',
        };
      }
      return techCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllTechCategory(data: any): Promise<any> {
    try {
      const techCategory = await this.techCategoryRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
      });
      if (!techCategory.length) {
        return {
          status: 500,
          message: 'No Tech Category found.',
        };
      }
      return techCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteTechCategory(id: number): Promise<any> {
    try {
      const techCategory = await this.techCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!techCategory) {
        return {
          status: 500,
          message: 'No Tech Category found.',
        };
      }

      await this.techCategoryRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createSubCategoryFaq(
    data: ProductSubCategoryfaqDto,
    user_id: number,
  ): Promise<any> {
    try {
      const subcategory = await this.productSubCategoryRepository.findOne({
        where: {
          id: data.product_subcategory_id,
        },
      });

      if (!subcategory) {
        return {
          status: 500,
          message: 'No SubCategory found.',
        };
      }
      const SubFaqs = new ProductSubCategoryFaq();
      SubFaqs.question = data.question;
      SubFaqs.answer = data.answer;
      SubFaqs.default_answer = data.default_answer;
      SubFaqs.product_subcategory = subcategory;
      SubFaqs.created_by = user_id;
      SubFaqs.percentage = data.percentage;
      await this.saveWithOrderSubCategoryFaq(SubFaqs);
      return SubFaqs;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateSubCategoryFaq(id: number, data: any): Promise<any> {
    try {
      const productFaq = await this.productSubCategoryFaqRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!productFaq) {
        return {
          status: 500,
          message: 'No Subcategory Faq found.',
        };
      }
      const productSubCategory =
        await this.productSubCategoryRepository.findOne({
          where: {
            id: data.product_subcategory_id,
          },
        });

      data.product_subcategory = productSubCategory;
      delete data.product_subcategory_id;
      await this.productSubCategoryFaqRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSubCategoryFaqById(id: number): Promise<any> {
    try {
      const subCategoryFaq = await this.productSubCategoryFaqRepository.findOne(
        {
          where: {
            id: id,
          },
        },
      );

      if (!subCategoryFaq) {
        return {
          status: 500,
          message: 'No SubCategory Faq found.',
        };
      }
      return subCategoryFaq;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async getAllProductSubCategoryFaq(data: any): Promise<any> {
    try {
      const subCategoryFaq = await this.productSubCategoryFaqRepository.find({
        order: {
          id: 'DESC',
        },
        take: data.take,
        skip: data.skip,
        relations: [
          'product_subcategory',
          'product_subcategory.product_category',
        ],
      });
      if (!subCategoryFaq.length) {
        return {
          status: 500,
          message: 'No SubCategory Faq found.',
        };
      }
      return subCategoryFaq;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSubCategoryFaqByCategory(id: number): Promise<any> {
    try {
      const productCategory = await this.productCategoryRepository.findOne({
        where: {
          id: id,
        },
      });
      const subCategory: any = await this.productSubCategoryRepository.find({
        where: {
          product_category: {
            id: id,
          },
        },
      });
      const subCatIds = await this.arrayColumn(subCategory, 'id');
      const faq: any = await this.productSubCategoryFaqRepository.find({
        where: {
          product_subcategory: {
            id: In(subCatIds),
          },
        },
        relations: ['product_subcategory'],
      });
      for (let i = 0; i < faq.length; i++) {
        faq[i].product_category = productCategory;
      }
      return faq;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSubCategoryFaqBySubCategory(id: number): Promise<any> {
    try {
      const subCategoryFaq: any =
        await this.productSubCategoryFaqRepository.find({
          where: {
            product_subcategory: {
              id: id,
            },
          },
        });
      if (!subCategoryFaq.length) {
        return {
          status: 500,
          message: 'No SubCategory Faq found.',
        };
      }
      return subCategoryFaq;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteSubCategoryFaq(id: number): Promise<any> {
    try {
      const subCategoryFaq = await this.productSubCategoryFaqRepository.findOne(
        {
          where: {
            id: id,
          },
        },
      );

      if (!subCategoryFaq) {
        return {
          status: 500,
          message: 'No SubCategory Faq found.',
        };
      }

      await this.deleteAndReorderSubCategoryFaq(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createProject(data: CreateProjectBasicDTO, avatar: any): Promise<any> {
    try {
      let cover_img;

      if (avatar) {
        cover_img = await this.s3Service.uploadFile(avatar);
      }

      const adminDto: any = data;
      adminDto.project_image = cover_img.Location;
      const createdRes = await firstValueFrom(
        this.productLauncherClient.send('add_project', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateProject(
    data: UpdateProjectBasicDTO,
    id: number,
    avatar: any,
  ): Promise<any> {
    try {
      let cover_img;
      const new_data: any = data;

      if (avatar) {
        cover_img = await this.s3Service.uploadFile(avatar);
        new_data.project_image = cover_img.Location;
      }

      new_data.id = id;

      return await firstValueFrom(
        this.productLauncherClient.send(
          'update_project',
          JSON.stringify(new_data),
        ),
      );
    } catch (error) {
      console.log('err -->', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllProject(data: any): Promise<any> {
    try {
      const course = await firstValueFrom(
        this.productLauncherClient.send(
          'get_all_project',
          JSON.stringify(data),
        ),
      );

      return course;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectById(id: number): Promise<any> {
    try {
      const project = await firstValueFrom(
        this.productLauncherClient.send('get_project_by_id', id),
      );
      return project;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteProject(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.productLauncherClient.send('delete_project', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getFaqBySubCategoryId(id: number): Promise<any> {
    try {
      const project: any = await this.productSubCategoryFaqRepository.findOne({
        where: {
          product_subcategory: {
            id: id,
          },
        },
      });
      if (!project) {
        return {
          status: 500,
          message: 'No Product Faq found.',
        };
      }
      return project;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getSubCategoryByCategoryId(id: number): Promise<any> {
    try {
      const subCategory: any = await this.productSubCategoryRepository.find({
        where: {
          product_category: {
            id: id,
          },
        },
      });
      if (!subCategory.length) {
        return {
          status: 500,
          message: 'No Product SubCategory found.',
        };
      }
      for (let i = 0; i < subCategory.length; i++) {
        const count = await this.productSubCategoryFaqRepository.count({
          where: {
            product_subcategory: subCategory[i],
          },
        });
        subCategory[i].question_count = count;
      }
      return subCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getInnovationCategoryByIds(id: number[]): Promise<any> {
    try {
      const category = await this.innovationCategoryRepository.find({
        where: {
          id: In(id),
        },
      });
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTechCategoryByIds(id: number[]): Promise<any> {
    try {
      const category = await this.techCategoryRepository.find({
        where: {
          id: In(id),
        },
      });
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addProjectAssessment(data: AssessmentDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.productLauncherClient.send('add_assessment', JSON.stringify(data)),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectAssessmentByProjectId(id: number): Promise<any> {
    try {
      const projectAssessment = await firstValueFrom(
        this.productLauncherClient.send(
          'get_project_assessment_by_project_id',
          id,
        ),
      );
      return projectAssessment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectAssessmentBySubCategoryId(id: number): Promise<any> {
    try {
      const projectAssessment = await firstValueFrom(
        this.productLauncherClient.send(
          'get_project_assessment_by_subcategory_id',
          id,
        ),
      );
      return projectAssessment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectAssessmentByCategoryId(id: number): Promise<any> {
    try {
      const projectAssessment = await firstValueFrom(
        this.productLauncherClient.send(
          'get_project_assessment_by_category_id',
          id,
        ),
      );
      return projectAssessment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addProjectMember(data: ProjectMemberDto): Promise<any> {
    try {
      const createdRes = await firstValueFrom(
        this.productLauncherClient.send(
          'add_project_member',
          JSON.stringify(data),
        ),
      );

      return createdRes;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectMemberByProjectId(id: number): Promise<any> {
    try {
      const projectMember = await firstValueFrom(
        this.productLauncherClient.send('get_project_member_by_project_id', id),
      );
      return projectMember;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteProjectMemberByProjectId(id: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.productLauncherClient.send('delete_project_member', id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getProjectMemberById(id: number): Promise<any> {
    try {
      const projectMember = await firstValueFrom(
        this.productLauncherClient.send('get_project_member_by_id', id),
      );
      return projectMember;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateOrder(data: UpdateOrderDTO): Promise<any> {
    try {
      let useRepo;
      if (data.update_order_for == UPDATE_ORDER.PRODUCT_CATEGORY) {
        useRepo = this.productCategoryRepository;
      }
      if (data.update_order_for == UPDATE_ORDER.PRODUCT_SUB_CATEGORY) {
        useRepo = this.productSubCategoryRepository;
      }
      if (data.update_order_for == UPDATE_ORDER.PRODUCT_SUB_CATEGORY_FAQ) {
        useRepo = this.productSubCategoryFaqRepository;
      }

      const base_data = await useRepo.findOne({
        where: {
          id: data.base_id,
        },
      });
      if (!base_data) {
        return {
          status: 500,
          message: 'No base data found.',
        };
      }
      const update_data = await useRepo.findOne({
        where: {
          id: data.update_id,
        },
      });
      if (!update_data) {
        return {
          status: 500,
          message: 'No update data found.',
        };
      }
      const base_order = base_data.order;
      const update_order = update_data.order;

      base_data.order = update_order;
      update_data.order = base_order;

      await useRepo.save(base_data);
      await useRepo.save(update_data);
      return {
        status: 200,
        message: 'Order updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
