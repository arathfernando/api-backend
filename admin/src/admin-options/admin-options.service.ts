import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import Badge from 'src/database/entities/badge.entity';
import BasicTypeCategory from 'src/database/entities/basic-type-category.entity';
import BasicType from 'src/database/entities/basic-type.entity';
import ContestCategory from 'src/database/entities/contest-category.entity';
import Country from 'src/database/entities/country.entity';
import CourseCategory from 'src/database/entities/course-category.entity';
import Currency from 'src/database/entities/currency.entity';
import ExpertiseCategory from 'src/database/entities/expertise-category.entity';
import Goal from 'src/database/entities/goal.entity';
import LanguageLevel from 'src/database/entities/language-level.entity';
import Language from 'src/database/entities/language.entity';
import ModuleType from 'src/database/entities/module-type.entity';
import { translate } from '@vitalets/google-translate-api';
import PartnerType from 'src/database/entities/partner-type.entity';
import Social from 'src/database/entities/social.entity';
import Timezone from 'src/database/entities/timezone.entity';
import TranslationLanguages from 'src/database/entities/translation-language.entity';
import {
  CourseCategoryDto,
  CreateAdminArticleDto,
  CreateBadgeDto,
  CreateContestCategoryDto,
  CreateGoalDto,
  CreateModuleTypeDto,
  CreatePartnerTypeDto,
  CreateTranslationProjectLanguageDto,
  CreateTranslationProjectValueDto,
  GetKeyBySearch,
  PaginationDto,
  UpdateCourseCategoryDto,
} from 'src/helper/dtos';
import { BasicTypeCategoryDto } from 'src/helper/dtos/basic-type-category.dto';
import { BasicTypeDto } from 'src/helper/dtos/basic-type.dto';
import { CountryDto } from 'src/helper/dtos/country.dto';
import { CurrencyDto } from 'src/helper/dtos/currency.dto';
import { ExpertiseCategoryDto } from 'src/helper/dtos/expertise-category.dto';
import { LanguageLevelDto } from 'src/helper/dtos/language-level.dto';
import { LanguageDto } from 'src/helper/dtos/language.dto';
import { SocialDto } from 'src/helper/dtos/social.dto';
import { TimezoneDto } from 'src/helper/dtos/timezone.dto';
import { IBasicLanguage } from 'src/helper/interfaces';
import { S3Service } from 'src/helper/services/s3/s3.service';
import { ILike, In, Repository } from 'typeorm';
import { allLanguages } from '../database/migrations/languages';
import { allCurrencies } from '../database/migrations/currencies';
import { allCountries } from '../database/migrations/countries';
import { TRUE_FALSE } from 'src/helper/constant';
import { allTimezones } from 'src/database/migrations/timezones';
import Article from 'src/database/entities/article.entity';
import {
  CreateNationalityDto,
  UpdateNationalityDto,
} from 'src/helper/dtos/nationality.dto';
import Nationality from 'src/database/entities/nationality.entity';
import { allNationalities } from 'src/database/migrations/nationalities';
import {
  CreateAdminRoleDto,
  UpdateAdminRoleDto,
} from 'src/helper/dtos/create-role.dto';
import AdminRole from 'src/database/entities/admin-role.entity';
import {
  CreatePromptTypeDto,
  UpdatePromptTypeDto,
} from 'src/helper/dtos/prompt-type.dto.';
import PromptType from 'src/database/entities/prompt_type.entity';
import { CreatePromptDto } from 'src/helper/dtos/prompt.dto.';
import Prompt from 'src/database/entities/prompt.entity';
import {
  CreateTranslationProjectDto,
  UpdateTranslationProjectDto,
} from 'src/helper/dtos/translation-project.dto';
import TranslationProject from 'src/database/entities/translation-project.entity';
import TranslationProjectLanguage from 'src/database/entities/translation-project-language.entity';
import TranslationProjectKey from 'src/database/entities/translation-project-key.entity';
import TranslationProjectValue from 'src/database/entities/translation-project-value.entity';
import { CreateDefaultCriteriaDto } from 'src/helper/dtos/create-default-criteria.dto';
import DefaultCriteria from 'src/database/entities/default-criteria.entity';
import { DefaultCriteriaAllProcessDto } from 'src/helper/dtos/default-criteria.dto';
import {
  CreateAdminNotificationDto,
  UpdateAdminNotificationDto,
} from 'src/helper/dtos/admin-notification.dto';
import AdminNotification from 'src/database/entities/admin-notification.entity';
import { CreateWalkthroughCategoryDto } from 'src/helper/dtos/walkthrough-category.dto';
import WalkthroughCategory from 'src/database/entities/walkthrough-category.entity';
import { WalkthroughCategoryAllProcessDto } from 'src/helper/dtos/default-walk-through.dto';
import { CreateWalkthroughStepDto } from 'src/helper/dtos/walkthrough-step.dto';
import WalkthroughStep from 'src/database/entities/walkthrough-step.entity';
import Admin from 'src/database/entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminOptionsService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,

    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(PromptType)
    private readonly promptTypeRepository: Repository<PromptType>,
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
    @InjectRepository(BasicTypeCategory)
    private readonly basicTypeCateRepo: Repository<BasicTypeCategory>,
    @InjectRepository(BasicType)
    private readonly basicTypeRepo: Repository<BasicType>,
    @InjectRepository(ExpertiseCategory)
    private readonly expertiseCateRepo: Repository<ExpertiseCategory>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(LanguageLevel)
    private readonly languageLevelRepository: Repository<LanguageLevel>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(Timezone)
    private readonly timezoneRepository: Repository<Timezone>,
    @InjectRepository(Social)
    private readonly socialRepository: Repository<Social>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(TranslationLanguages)
    private readonly translationLanguageRepository: Repository<TranslationLanguages>,
    @InjectRepository(ContestCategory)
    private readonly contestCategoryRepository: Repository<ContestCategory>,
    @InjectRepository(PartnerType)
    private readonly partnerTypeRepository: Repository<PartnerType>,
    @InjectRepository(ModuleType)
    private readonly moduleTypeRepository: Repository<ModuleType>,
    @InjectRepository(CourseCategory)
    private readonly courseCategoryRepository: Repository<CourseCategory>,
    @InjectRepository(AdminRole)
    private readonly adminRoleRepository: Repository<AdminRole>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Nationality)
    private readonly nationalityRepository: Repository<Nationality>,
    @InjectRepository(TranslationProject)
    private readonly translationProjectRepository: Repository<TranslationProject>,
    @InjectRepository(TranslationProjectKey)
    private readonly translationProjectKeyRepository: Repository<TranslationProjectKey>,
    @InjectRepository(TranslationProjectValue)
    private readonly translationProjectValueRepository: Repository<TranslationProjectValue>,
    @InjectRepository(TranslationProjectLanguage)
    private readonly translationProjectLanguageRepository: Repository<TranslationProjectLanguage>,
    @InjectRepository(DefaultCriteria)
    private readonly defaultCriteriaRepository: Repository<DefaultCriteria>,
    @InjectRepository(AdminNotification)
    private readonly adminNotificationRepository: Repository<AdminNotification>,
    @InjectRepository(WalkthroughStep)
    private readonly walkthroughStepRepository: Repository<WalkthroughStep>,
    @InjectRepository(WalkthroughCategory)
    private readonly walkthroughCategoryRepository: Repository<WalkthroughCategory>,
    private readonly s3Service: S3Service,
  ) {}

  async deleteAndReorder(id: number): Promise<any> {
    const itemToDelete = await this.walkthroughStepRepository.findOne({
      where: {
        id: id,
      },
    });
    await this.walkthroughStepRepository.delete(id);

    const itemsToUpdate = await this.walkthroughStepRepository
      .createQueryBuilder('e')
      .where('e.order > :order', { order: itemToDelete.order })
      .getMany();

    for (const item of itemsToUpdate) {
      item.order--;
    }
    await this.walkthroughStepRepository.save(itemsToUpdate);
  }
  async saveWithOrder(data: any): Promise<any> {
    const maxOrder = await this.walkthroughStepRepository.query(
      `SELECT MAX(psf.order) AS max_order FROM walkthrough_step AS psf;`,
    );
    data.order = maxOrder[0].max_order + 1;
    return await this.walkthroughStepRepository.save(data);
  }

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  async createBasicTypeCategory(
    data: BasicTypeCategoryDto,
    user_id: number,
  ): Promise<any> {
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: user_id,
        },
      });

      const create = new BasicTypeCategory();
      create.name = data.name;
      create.display_name = data.display_name;
      create.description = data.description;
      create.user = admin;

      await this.basicTypeCateRepo.save(create);

      delete create.user;

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateBasicTypeCategory(id: number, data: any): Promise<any> {
    try {
      const btc = await this.basicTypeCateRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      let parentCat: BasicTypeCategory;
      if (data.parent_category) {
        parentCat = await this.basicTypeCateRepo.findOne({
          where: {
            id: data.parent_category,
          },
        });
        data.parent_category = parentCat;
      }

      await this.basicTypeCateRepo.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBasicTypeCategory(): Promise<any> {
    try {
      return await this.basicTypeCateRepo.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBasicTypeCategoryById(id: number): Promise<any> {
    try {
      return (
        (await this.basicTypeCateRepo.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteBasicTypeCategory(id: number): Promise<any> {
    try {
      const btc = await this.basicTypeCateRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.basicTypeCateRepo.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createBasicType(
    file: any,
    data: BasicTypeDto,
    user_id: number,
  ): Promise<any> {
    try {
      let image;

      if (file) {
        image = await this.s3Service.uploadFile(file);
      }

      const admin = await this.adminRepository.findOne({
        where: {
          id: user_id,
        },
      });

      let category: any = null;
      if (data.category) {
        category = await this.getBasicTypeCategoryById(data.category);
      }

      const create = new BasicType();
      create.name = data.name;
      create.description = data.description;
      create.category = category ? category : null;
      create.image = image ? image.Location : null;
      create.user = admin;

      await this.basicTypeRepo.save(create);
      delete create.user;

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateBasicType(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let avatar;
      if (file) {
        avatar = await this.s3Service.uploadFile(file);
        data.image = avatar.Location;
      }

      const btc = await this.basicTypeRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      let category: BasicTypeCategory;
      if (data.category && data.category > 0) {
        category = await this.basicTypeCateRepo.findOne({
          where: {
            id: data.category,
          },
        });
        data.category = category;
      }

      await this.basicTypeRepo.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBasicType(): Promise<any> {
    try {
      return await this.basicTypeRepo.find({
        relations: ['category'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBasicTypeById(id: number): Promise<any> {
    try {
      return (
        (await this.basicTypeRepo.findOne({
          where: {
            id: id,
          },
          relations: ['category'],
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBasicTypeByIds(ids: any): Promise<any> {
    try {
      const interest = await this.basicTypeRepo.find({
        where: {
          id: In(ids),
        },
      });
      return interest || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBasicTypeByCategory(id: number): Promise<any> {
    try {
      return await this.basicTypeRepo.find({
        where: {
          category: {
            id: id,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteBasicType(id: number): Promise<any> {
    try {
      const btc = await this.basicTypeRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.basicTypeRepo.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createExpertiseCategory(
    file: any,
    data: ExpertiseCategoryDto,
  ): Promise<any> {
    try {
      let icon;

      if (file) {
        icon = await this.s3Service.uploadFile(file);
      }

      const create = new ExpertiseCategory();
      create.name = data.name;
      create.description = data.description;
      create.icon = icon ? icon.Location : null;

      await this.expertiseCateRepo.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateExpertiseCategory(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let icon;
      if (file) {
        icon = await this.s3Service.uploadFile(file);
        data.icon = icon.Location;
      }

      const ec = await this.expertiseCateRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!ec) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.expertiseCateRepo.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getExpertiseCategory(): Promise<any> {
    try {
      return await this.expertiseCateRepo.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getExpertiseCategoryById(id: number): Promise<any> {
    try {
      return (
        (await this.expertiseCateRepo.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteExpertiseCategory(id: number): Promise<any> {
    try {
      const btc = await this.expertiseCateRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.expertiseCateRepo.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createLanguage(
    data: LanguageDto,
    user_id: number,
  ): Promise<IBasicLanguage> {
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: user_id,
        },
      });
      const create = new Language();
      create.language_code = data.language_code;
      create.language_name = data.language_name;
      create.native_name = data.native_name;
      create.user = admin;

      await this.languageRepository.save(create);

      delete create.user;
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addDefaultLanguages(): Promise<any> {
    try {
      for (let i = 0; i < allLanguages.length; i++) {
        const lang = new Language();
        lang.language_code = allLanguages[i].code;
        lang.language_name = allLanguages[i].name;
        lang.native_name = allLanguages[i].nativeName;
        lang.user = null;
        await this.languageRepository.save(lang);
      }

      return await this.languageRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateLanguage(id: number, data: any): Promise<any> {
    try {
      const btc = await this.languageRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.languageRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLanguages(): Promise<any> {
    try {
      return await this.languageRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLanguageById(id: number): Promise<any> {
    try {
      return (
        (await this.languageRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLanguageByCode(code: string): Promise<any> {
    try {
      return (
        (await this.languageRepository.findOne({
          where: {
            language_code: code,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteLanguage(id: number): Promise<any> {
    try {
      const btc = await this.languageRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.languageRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createCountry(data: CountryDto): Promise<any> {
    try {
      const create = new Country();
      create.country_name = data.country_name;
      create.short_name = data.short_name;
      create.continent = data.continent;

      return await this.countryRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addDefaultCountries(): Promise<any> {
    try {
      for (let i = 0; i < allCountries.length; i++) {
        const country = new Country();
        country.continent = allCountries[i].continent;
        country.country_name = allCountries[i].country_name;
        country.short_name = allCountries[i].short_name;
        await this.countryRepository.save(country);
      }
      return await this.countryRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateCountry(id: number, data: any): Promise<any> {
    try {
      const country = await this.countryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!country) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.countryRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getCountries(): Promise<any> {
    try {
      return await this.countryRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getCountryById(id: number): Promise<any> {
    try {
      return (
        (await this.countryRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCountry(id: number): Promise<any> {
    try {
      const btc = await this.countryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.countryRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createLanguageLevel(
    data: LanguageLevelDto,
    user_id: number,
  ): Promise<any> {
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: user_id,
        },
      });
      const create = new LanguageLevel();
      create.language_level_name = data.language_level_name;
      create.description = data.description;
      create.user = admin;

      await this.languageLevelRepository.save(create);

      delete create.user;
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateLanguageLevel(id: number, data: any): Promise<any> {
    try {
      const btc = await this.languageLevelRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.languageLevelRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLanguageLevels(): Promise<any> {
    try {
      return await this.languageLevelRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getLanguageLevelById(id: number): Promise<any> {
    try {
      return await this.languageLevelRepository.findOne({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteLanguageLevel(id: number): Promise<any> {
    try {
      const btc = await this.languageLevelRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.languageLevelRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createCurrency(data: CurrencyDto): Promise<any> {
    try {
      const create = new Currency();
      create.name = data.name;
      create.name_plural = data.name_plural;
      create.symbol = data.symbol;
      create.symbol_native = data.symbol_native;
      create.currency_code = data.currency_code;
      create.decimal_digit = data.decimal_digit;
      create.rounding = data.rounding;
      create.is_crypto = data.is_crypto;

      return await this.currencyRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async addDefaultCurrency(): Promise<any> {
    try {
      for (let i = 0; i < allCurrencies.length; i++) {
        const currency = new Currency();
        currency.currency_code = allCurrencies[i].currency_code;
        currency.decimal_digit = String(allCurrencies[i].decimal_digit);
        currency.name = allCurrencies[i].name;
        currency.name_plural = allCurrencies[i].name_plural;
        currency.rounding = String(allCurrencies[i].rounding);
        currency.symbol = allCurrencies[i].symbol;
        currency.symbol_native = allCurrencies[i].symbol_native;
        currency.is_crypto = TRUE_FALSE.FALSE;
        await this.currencyRepository.save(currency);
      }
      return await this.currencyRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateCurrency(id: number, data: any): Promise<any> {
    try {
      const btc = await this.currencyRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.currencyRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getCurrencies(): Promise<any> {
    try {
      return (await this.currencyRepository.find()) || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getCurrencyById(id: number): Promise<any> {
    try {
      const currency = await this.currencyRepository.findOne({
        where: {
          id: id,
        },
      });
      return currency || null;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCurrency(id: number): Promise<any> {
    try {
      const btc = await this.currencyRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.currencyRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createTimezone(data: TimezoneDto): Promise<any> {
    try {
      const create = new Timezone();
      create.timezone_value = data.timezone_value;
      create.timezone_abbr = data.timezone_abbr;
      create.offset = data.offset;
      create.dst = data.dst;
      create.timezone_text = data.timezone_text;
      create.timezone_utc = data.timezone_utc;

      return await this.timezoneRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addDefaultTimezone(): Promise<any> {
    try {
      for (let i = 0; i < allTimezones.length; i++) {
        const timezone = new Timezone();
        timezone.dst =
          allTimezones[i].dst == false ? TRUE_FALSE.FALSE : TRUE_FALSE.TRUE;
        timezone.offset = String(allTimezones[i].offset);
        timezone.timezone_abbr = allTimezones[i].timezone_abbr;
        timezone.timezone_text = allTimezones[i].timezone_text;
        timezone.timezone_value = allTimezones[i].timezone_value;
        timezone.timezone_utc = allTimezones[i].timezone_utc[0];
        await this.timezoneRepository.save(timezone);
      }
      return await this.timezoneRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateTimezone(id: number, data: any): Promise<any> {
    try {
      const btc = await this.timezoneRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }
      await this.timezoneRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTimezones(): Promise<any> {
    try {
      return await this.timezoneRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTimezoneById(id: number): Promise<any> {
    try {
      return await this.timezoneRepository.findOne({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteTimezone(id: number): Promise<any> {
    try {
      const btc = await this.timezoneRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.timezoneRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createSocial(file: any, data: SocialDto): Promise<any> {
    try {
      let logo;

      if (file) {
        logo = await this.s3Service.uploadFile(file);
      }

      const create = new Social();
      create.name = data.name;
      create.description = data.description;
      create.logo = logo ? logo.Location : null;

      return await this.socialRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateSocial(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let logo;
      if (file) {
        logo = await this.s3Service.uploadFile(file);
        data.logo = logo.Location;
      }

      const social = await this.socialRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!social) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.socialRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSocials(): Promise<any> {
    try {
      return await this.socialRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSocialById(id: number): Promise<any> {
    try {
      return (
        (await this.socialRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteSocial(id: number): Promise<any> {
    try {
      const btc = await this.socialRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.socialRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async createPromptType(data: CreatePromptTypeDto): Promise<any> {
    try {
      const create = new PromptType();
      create.name = data.name;
      create.variable_names = data.variable_names;

      return await this.promptTypeRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updatePromptType(id: number, data: UpdatePromptTypeDto): Promise<any> {
    try {
      const type = await this.promptTypeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!type) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.promptTypeRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPromptType(data: any): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      return await this.promptTypeRepository.find({
        take: data.limit,
        skip,
        order: {
          id: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPromptTypeById(id: number): Promise<any> {
    try {
      return (
        (await this.promptTypeRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deletePromptType(id: number): Promise<any> {
    try {
      const btc = await this.promptTypeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.promptTypeRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createPrompt(data: CreatePromptDto): Promise<any> {
    try {
      const prompt_type = await this.promptTypeRepository.findOne({
        where: {
          id: data.prompt_type,
        },
      });
      const create = new Prompt();
      create.prompt_text = data.prompt_text;
      create.prompt_type = prompt_type;

      return await this.promptRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updatePrompt(id: number, data: any): Promise<any> {
    try {
      const prompt = await this.promptRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!prompt) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }
      if (data.prompt_type) {
        const prompt_type = await this.promptTypeRepository.findOne({
          where: {
            id: data.prompt_type,
          },
        });
        data.prompt_type = prompt_type;
      }
      await this.promptRepository.update(id, data);
      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPrompt(data: any): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;

      const prompt = await this.promptRepository.find({
        take: data.limit,
        skip,
        order: {
          id: 'DESC',
        },
        relations: ['prompt_type'],
      });
      return prompt;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPromptById(id: number): Promise<any> {
    try {
      return (
        (await this.promptRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deletePrompt(id: number): Promise<any> {
    try {
      const btc = await this.promptRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.promptRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createGoal(file: any, data: CreateGoalDto): Promise<any> {
    try {
      let logo;

      if (file) {
        logo = await this.s3Service.uploadFile(file);
      }

      const existingOrder = await this.goalRepository.findOne({
        where: {
          goal_number: data.goal_number,
        },
      });

      if (existingOrder) {
        throw new HttpException('ORDER_EXISTS', HttpStatus.CONFLICT);
      }

      const create = new Goal();
      create.goal_title = data.goal_title;
      create.description = data.description;
      create.goal_image = logo ? logo.Location : null;
      create.goal_number = data.goal_number;
      create.color = data.color;

      return await this.goalRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateGoal(id: number, file: any, data: any): Promise<any> {
    try {
      let logo;
      if (file) {
        logo = await this.s3Service.uploadFile(file);
        data.goal_image = logo.Location;
      }

      const goal = await this.goalRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!goal) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      const existingOrder = await this.goalRepository.findOne({
        where: {
          goal_number: data.goal_number,
        },
      });

      if (existingOrder) {
        throw new HttpException('ORDER_EXISTS', HttpStatus.CONFLICT);
      }

      await this.goalRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGoals(): Promise<any> {
    try {
      const goals = await this.goalRepository.find({
        order: {
          goal_number: 'ASC',
        },
      });

      return goals;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGoalById(id: number): Promise<any> {
    try {
      return (
        (await this.goalRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGoalByIdsData(ids: any): Promise<any> {
    try {
      const contestCategories = await this.goalRepository.find({
        where: {
          id: In(ids),
        },
      });
      return contestCategories || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteGoal(id: number): Promise<any> {
    try {
      const btc = await this.goalRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.goalRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createBadge(file: any, data: CreateBadgeDto): Promise<any> {
    try {
      let logo;

      if (file) {
        logo = await this.s3Service.uploadFile(file);
      }
      const create = new Badge();
      create.badge_name = data.badge_name;
      create.badge_category = data.badge_category;
      create.level = data.level;
      create.hbb_points = data.hbb_points;
      create.badge_image = logo ? logo.Location : null;

      return await this.badgeRepository.save(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateBadge(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let logo;
      if (file) {
        logo = await this.s3Service.uploadFile(file);
        data.badge_image = logo.Location;
      }

      const goal = await this.badgeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!goal) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.badgeRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBadges(): Promise<any> {
    try {
      const badges = await this.badgeRepository.find({
        order: {
          id: 'DESC',
        },
      });

      return badges;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBadgeById(id: number): Promise<any> {
    try {
      return (
        (await this.badgeRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteBadge(id: number): Promise<any> {
    try {
      const btc = await this.badgeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.badgeRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createTranslationLanguage(file: any, data: any): Promise<any> {
    try {
      let icon;

      if (file && typeof file != 'string') {
        icon = await this.s3Service.uploadFile(file);
      }

      const create = new TranslationLanguages();
      create.language_code = data.language_code;
      create.language_name = data.language_name;
      create.flag =
        file && typeof file !== 'string' ? icon.Location : data.icon;

      await this.translationLanguageRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateTranslationLanguage(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let icon;
      if (file) {
        icon = await this.s3Service.uploadFile(file);
        data.icon = icon.Location;
      }

      const ec = await this.translationLanguageRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!ec) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.translationLanguageRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTranslationLanguages(): Promise<any> {
    try {
      return await this.translationLanguageRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTranslationLanguageById(id: number): Promise<any> {
    try {
      return (
        (await this.translationLanguageRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteTranslationLanguage(id: number): Promise<any> {
    try {
      const btc = await this.translationLanguageRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.translationLanguageRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createContestCategory(
    file: any,
    data: CreateContestCategoryDto,
  ): Promise<any> {
    try {
      let image;

      if (file) {
        image = await this.s3Service.uploadFile(file);
      }

      const create = new ContestCategory();
      create.title = data.title;
      create.contest_standard_rule = data.contest_standard_rule;
      create.description = data.description;
      create.prompts_text = data.prompts_text;
      create.image = image ? image.Location : null;

      await this.contestCategoryRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateContestCategory(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let image;
      if (file) {
        image = await this.s3Service.uploadFile(file);
        data.image = image.Location;
      }

      const ec = await this.contestCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!ec) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.contestCategoryRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getContestCategories(): Promise<any> {
    try {
      return (await this.contestCategoryRepository.find()) || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getContestCategoryById(id: number): Promise<any> {
    try {
      return (
        (await this.contestCategoryRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteContestCategory(id: number): Promise<any> {
    try {
      const btc = await this.contestCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.contestCategoryRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createPartnerType(data: CreatePartnerTypeDto): Promise<any> {
    try {
      const create = new PartnerType();
      create.type = data.type;

      await this.partnerTypeRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updatePartnerType(id: number, data: any): Promise<any> {
    try {
      const ec = await this.partnerTypeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!ec) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.partnerTypeRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPartnerType(): Promise<any> {
    try {
      return (await this.partnerTypeRepository.find()) || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPartnerTypeById(id: number): Promise<any> {
    try {
      return (
        (await this.partnerTypeRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deletePartnerType(id: number): Promise<any> {
    try {
      const btc = await this.partnerTypeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.partnerTypeRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createModuleType(file: any, data: CreateModuleTypeDto): Promise<any> {
    try {
      let image;

      if (file) {
        image = await this.s3Service.uploadFile(file);
      }

      const create = new ModuleType();
      create.name = data.name;
      create.slug = data.slug;
      create.short_description = data.short_description;
      create.description = data.description;
      create.image = image ? image.Location : null;
      create.partner_id = data.partner_id;
      create.published = data.published;
      create.cobuilding = data.cobuilding;
      create.beta_testing = data.beta_testing;

      await this.moduleTypeRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateModuleType(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let image;
      if (file) {
        image = await this.s3Service.uploadFile(file);
        data.image = image.Location;
      }

      const module = await this.moduleTypeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!module) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.moduleTypeRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllModuleType(): Promise<any> {
    try {
      const module = await this.moduleTypeRepository.find();
      const moduleRes: any = [...module];
      if (module.length > 0) {
        for (let i = 0; i < module.length; i++) {
          if (module[i].partner_id) {
            const partner = await firstValueFrom(
              this.userClient.send<any>(
                'get_partner_by_id',
                module[i].partner_id,
              ),
            );
            moduleRes[i].partner = partner;
          }
        }
      }
      return moduleRes || null;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getModuleTypeById(id: number): Promise<any> {
    try {
      const module: any = await this.moduleTypeRepository.findOne({
        where: {
          id: id,
        },
      });
      if (module && module.partner_id) {
        const partner = await firstValueFrom(
          this.userClient.send<any>('get_partner_by_id', module.partner_id),
        );
        module.partner = partner;
      }
      return module || null;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteModuleType(id: number): Promise<any> {
    try {
      const module = await this.moduleTypeRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!module) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.moduleTypeRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createCourseCategory(data: CourseCategoryDto): Promise<any> {
    try {
      const create = new CourseCategory();
      create.name = data.name;
      create.description = data.description;
      create.created_by = data.created_by;
      create.prompts_text = data.prompts_text;

      await this.courseCategoryRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateCourseCategory(
    id: number,
    data: UpdateCourseCategoryDto,
  ): Promise<any> {
    try {
      const ec = await this.courseCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!ec) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.courseCategoryRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getCourseCategories(): Promise<any> {
    try {
      const cc = await this.courseCategoryRepository.find();
      if (!cc) {
        return {
          statusCode: 500,
          message: 'Course Category not found',
        };
      }
      const CourseCategory: any = [...cc];
      for (let i = 0; i < CourseCategory.length; i++) {
        CourseCategory[i].created_by = await this.getUser(
          CourseCategory[i].created_by,
        );
      }

      return CourseCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getCourseCategoryById(id: number): Promise<any> {
    try {
      return (
        (await this.courseCategoryRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCourseCategory(id: number): Promise<any> {
    try {
      const btc = await this.courseCategoryRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.courseCategoryRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createArticle(data: CreateAdminArticleDto, file: any): Promise<any> {
    try {
      const avatar = await this.s3Service.uploadFile(file);

      const create = new Article();
      create.article_title = data.article_title;
      create.article_description = data.article_description;
      create.created_by = data.created_by;
      create.image = avatar.Location;

      await this.articleRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateArticle(
    file: Express.Multer.File,
    id: number,
    data: any,
  ): Promise<any> {
    try {
      let avatar;
      if (file) {
        avatar = await this.s3Service.uploadFile(file);
        data.image = avatar.Location;
      }

      const article = await this.articleRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!article) {
        return {
          status: 500,
          message: 'Article Not Found',
        };
      }
      await this.articleRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getArticle(data: any): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const total = await this.articleRepository.count();
      const totalPages = Math.ceil(total / data.limit);

      const article = await this.articleRepository.find({
        take: data.limit,
        skip,
        order: {
          id: 'DESC',
        },
      });

      if (!article) {
        return {
          statusCode: 500,
          message: 'Article Not Found',
        };
      }
      const articleRes: any = [...article];
      for (let i = 0; i < articleRes.length; i++) {
        articleRes[i].created_by = await this.getUser(articleRes[i].created_by);
      }

      return {
        data: articleRes,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getArticleById(id: number): Promise<any> {
    try {
      const article = await this.articleRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!article) {
        return {
          statusCode: 500,
          message: 'Article Not Found',
        };
      }
      article.created_by = await this.getUser(article.created_by);

      return article;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteArticle(id: number): Promise<any> {
    try {
      const article = await this.articleRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!article) {
        return {
          statusCode: 500,
          message: 'Article Not Found',
        };
      }
      await this.articleRepository.delete(id);
      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createNationality(data: CreateNationalityDto): Promise<any> {
    try {
      const create = new Nationality();
      create.nationality = data.nationality;

      await this.nationalityRepository.save(create);

      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateNationality(
    id: number,
    data: UpdateNationalityDto,
  ): Promise<any> {
    try {
      const ec = await this.nationalityRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!ec) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.nationalityRepository.update(id, data);

      return {
        status: 200,
        message: 'Updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getNationalities(): Promise<any> {
    try {
      const cc = await this.nationalityRepository.find();
      if (!cc) {
        return {
          statusCode: 500,
          message: 'Nationalities not found',
        };
      }
      return cc;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getNationalityById(id: number): Promise<any> {
    try {
      return (
        (await this.nationalityRepository.findOne({
          where: {
            id: id,
          },
        })) || null
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteNationality(id: number): Promise<any> {
    try {
      const btc = await this.nationalityRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!btc) {
        throw new HttpException('NOT_EXISTS', HttpStatus.CONFLICT);
      }

      await this.nationalityRepository.delete(id);

      return {
        status: 200,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addDefaultNationalities(): Promise<any> {
    try {
      for (let i = 0; i < allNationalities.length; i++) {
        const nationality = new Nationality();
        nationality.nationality = allNationalities[i];
        await this.nationalityRepository.save(nationality);
      }
      return await this.nationalityRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createAdminRole(data: CreateAdminRoleDto): Promise<any> {
    try {
      const adminRole = new AdminRole();
      adminRole.permission = data.permission;
      adminRole.role_name = data.role_name;
      await this.adminRoleRepository.save(adminRole);
      return adminRole;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAdminRole(
    id: number,
    data: UpdateAdminRoleDto,
  ): Promise<any> {
    try {
      const role = await this.adminRoleRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!role) {
        return {
          status: 500,
          message: 'No role found',
        };
      }
      await this.adminRoleRepository.update(id, data);
      return {
        status: 200,
        message: 'Role updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllAdminRole(): Promise<any> {
    try {
      return await this.adminRoleRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAdminRole(id: number): Promise<any> {
    try {
      return await this.adminRoleRepository.findOne({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteAdminRole(id: number): Promise<any> {
    try {
      await this.adminRoleRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Role deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addAutoTranslation(id: number): Promise<any> {
    try {
      const singleLanguage =
        await this.translationProjectLanguageRepository.findOne({
          where: {
            id: id,
          },
          relations: [
            'translation_project',
            'translation_project.translation_project_key',
            'translation_language',
          ],
        });
      if (!singleLanguage) {
        return {
          status: 500,
          message: 'No language.',
        };
      }
      for (
        let k = 0;
        k < singleLanguage.translation_project.translation_project_key.length;
        k++
      ) {
        const check = await this.translationProjectValueRepository.findOne({
          where: {
            translation_project_key:
              singleLanguage.translation_project.translation_project_key[k],
            translation_project_language: singleLanguage,
          },
        });
        if (!check) {
          const { text } = await translate(
            singleLanguage.translation_project.translation_project_key[k]
              .translation_key,
            {
              to: singleLanguage.translation_language.language_code,
            },
          );
          const newTranslationProjectValue = new TranslationProjectValue();
          newTranslationProjectValue.translation_project_key =
            singleLanguage.translation_project.translation_project_key[k];
          newTranslationProjectValue.translation_project_language =
            singleLanguage;
          newTranslationProjectValue.translation_value = text;
          this.translationProjectValueRepository.save(
            newTranslationProjectValue,
          );
        }
      }
      return {
        status: 200,
        message: 'Translation added successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createSlug(text: string): Promise<string> {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  public async createTranslationProject(
    data: CreateTranslationProjectDto,
  ): Promise<any> {
    try {
      const slug = await this.createSlug(data.project_name);
      const chkExistSlug = await this.translationProjectRepository.findOne({
        where: {
          project_slug: slug,
        },
      });
      if (chkExistSlug) {
        return {
          status: 500,
          message: 'Project already exist.',
        };
      }
      const translationProject = new TranslationProject();
      translationProject.project_name = data.project_name;
      translationProject.project_slug = slug;
      await this.translationProjectRepository.save(translationProject);
      return translationProject;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTranslationProject(
    id: number,
    data: UpdateTranslationProjectDto,
  ): Promise<any> {
    try {
      const translationProject =
        await this.translationProjectRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!translationProject) {
        return {
          status: 500,
          message: 'No Translation Project found',
        };
      }
      await this.translationProjectRepository.update(id, data);
      return {
        status: 200,
        message: 'Translation Project updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllTranslationProject(): Promise<any> {
    try {
      const translationProject: any =
        await this.translationProjectRepository.find({
          relations: [
            'translation_project_key',
            'translation_project_language',
            'translation_project_language.translation_language',
          ],
        });
      const projectData = [...translationProject];
      if (projectData) {
        for (let i = 0; i < projectData.length; i++) {
          if (projectData[i].translation_project_key) {
            projectData[i].no_of_Key =
              projectData[i].translation_project_key.length;
          }
        }
      }
      return projectData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteTranslationProject(id: number): Promise<any> {
    try {
      await this.translationProjectRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Translation Project deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createTranslationKey(data: any): Promise<any> {
    try {
      const translationProject =
        await this.translationProjectRepository.findOne({
          where: {
            id: data.translation_project_id,
          },
        });
      if (!translationProject) {
        return {
          status: 500,
          message: 'No translation Project found.',
        };
      }
      const response = [];
      for (let i = 0; i < data.translation_key.length; i++) {
        const check = await this.translationProjectKeyRepository.findOne({
          where: {
            translation_project: data.translation_project_id,
            translation_key: ILike(`%${data.translation_key}%`),
          },
        });
        if (check) {
          return {
            status: 500,
            message: 'This Translation key is already exist for this project ',
          };
        }
        const translationKey = new TranslationProjectKey();
        translationKey.translation_project = translationProject;
        translationKey.namespace = data.namespace;
        translationKey.translation_key = data.translation_key[i];
        response.push(translationKey);
      }
      await this.translationProjectKeyRepository.save(response);
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTranslationKey(id: number, data: any): Promise<any> {
    try {
      const translationProjectKey =
        await this.translationProjectKeyRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!translationProjectKey) {
        return {
          status: 500,
          message: 'No Translation Project key found',
        };
      }

      if (data.translation_project_id) {
        const translationProject =
          await this.translationProjectRepository.findOne({
            where: {
              id: data.translation_project_id,
            },
          });

        if (!translationProject) {
          return {
            status: 500,
            message: 'No Translate project found.',
          };
        }
        data.translation_project = translationProject;
        delete data.translation_project_id;
      }
      await this.translationProjectKeyRepository.update(id, data);

      return {
        status: 200,
        message: 'Translation Project key updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllTranslationKey(): Promise<any> {
    try {
      return await this.translationProjectKeyRepository.find({
        relations: [
          'translation_project',
          'translation_project_value',
          'translation_project_value.translation_project_language',
          'translation_project_value.translation_project_language.translation_language',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteTranslationKey(id: number): Promise<any> {
    try {
      await this.translationProjectKeyRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Translation Project key deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createTranslationValue(
    data: CreateTranslationProjectValueDto[],
  ): Promise<any> {
    try {
      const response = [];
      for (let i = 0; i < data.length; i++) {
        const translationProjectKey =
          await this.translationProjectKeyRepository.findOne({
            where: {
              id: data[i].translation_project_key_id,
            },
          });

        if (!translationProjectKey) {
          return {
            status: 500,
            message: 'No translation Project Key found.',
          };
        }
        const translationProjectLanguage =
          await this.translationProjectLanguageRepository.findOne({
            where: {
              id: data[i].translation_project_language_id,
            },
          });

        if (!translationProjectLanguage) {
          return {
            status: 500,
            message: 'No translation Project Language found.',
          };
        }
        const check = await this.translationProjectValueRepository.findOne({
          where: {
            translation_project_key: translationProjectKey,
            translation_project_language: translationProjectLanguage,
          },
        });
        if (check) {
          await this.translationProjectValueRepository.update(
            { id: check.id },
            {
              translation_value: data[i].translation_value,
            },
          );

          const updatedData =
            await this.translationProjectValueRepository.findOne({
              where: { id: check.id },
            });
          response.push(updatedData);
        } else {
          const translationValue = new TranslationProjectValue();
          translationValue.translation_project_key = translationProjectKey;
          translationValue.translation_project_language =
            translationProjectLanguage;
          translationValue.translation_value = data[i].translation_value;
          await this.translationProjectValueRepository.save(translationValue);
          response.push(translationValue);
        }
      }
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTranslationValue(data: any): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const translationValue =
          await this.translationProjectValueRepository.findOne({
            where: {
              id: data[i].id,
            },
          });
        if (!translationValue) {
          return {
            status: 500,
            message: 'Translation project Value not found',
          };
        }
        const translationProjectKey =
          await this.translationProjectKeyRepository.findOne({
            where: {
              id: data[i].translation_project_key_id,
            },
          });
        if (!translationProjectKey) {
          return {
            status: 500,
            message: 'No translation Key found.',
          };
        }
        data[i].translation_project_key = translationProjectKey;
        delete data[i].translation_project_key_id;

        const translationProjectLanguage =
          await this.translationProjectLanguageRepository.findOne({
            where: {
              id: data[i].translation_project_language_id,
            },
          });
        if (!translationProjectLanguage) {
          return {
            status: 500,
            message: 'No translation Project Language found.',
          };
        }
        data[i].translation_project_language = translationProjectLanguage;
        delete data[i].translation_project_language_id;
        await this.translationProjectValueRepository.update(
          data[i].id,
          data[i],
        );
      }

      return {
        status: 200,
        message: 'Translation Project value updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllTranslationValue(): Promise<any> {
    try {
      return await this.translationProjectValueRepository.find({
        relations: ['translation_project_key', 'translation_project_language'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteTranslationValue(id: number): Promise<any> {
    try {
      await this.translationProjectValueRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Translation Project value deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createTranslationLanguages(
    data: CreateTranslationProjectLanguageDto,
  ): Promise<any> {
    try {
      const translationProject =
        await this.translationProjectRepository.findOne({
          where: {
            id: data.translation_project_id,
          },
        });
      if (!translationProject) {
        return {
          status: 500,
          message: 'No translation Project found.',
        };
      }

      const translationLanguage =
        await this.translationLanguageRepository.findOne({
          where: {
            id: data.translation_language_id,
          },
        });
      if (!translationLanguage) {
        return {
          status: 500,
          message: 'No translation Language found.',
        };
      }

      const languageTranslation = new TranslationProjectLanguage();
      languageTranslation.translation_project = translationProject;
      languageTranslation.translation_language = translationLanguage;
      languageTranslation.is_default = data.is_default;
      await this.translationProjectLanguageRepository.save(languageTranslation);

      return languageTranslation;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTranslationLanguages(id: number, data: any): Promise<any> {
    try {
      const translationProjectLanguage =
        await this.translationProjectLanguageRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!translationProjectLanguage) {
        return {
          status: 500,
          message: 'No translation Project Language found.',
        };
      }

      if (data.translation_project_id) {
        const translationProject =
          await this.translationProjectRepository.findOne({
            where: {
              id: data.translation_project_id,
            },
          });

        if (!translationProject) {
          return {
            status: 500,
            message: 'No translation Project found.',
          };
        }
        data.translation_project = translationProject;
        delete data.translation_project_id;
      }

      if (data.translation_language_id) {
        const translationLanguage =
          await this.translationLanguageRepository.findOne({
            where: {
              id: data.translation_language_id,
            },
          });
        if (!translationLanguage) {
          return {
            status: 500,
            message: 'No translation Language found.',
          };
        }
        data.translation_language = translationLanguage;
        delete data.translation_language_id;
      }

      await this.translationProjectLanguageRepository.update(id, data);

      return {
        status: 200,
        message: 'Translation Language updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllTranslationLanguages(): Promise<any> {
    try {
      return await this.translationProjectLanguageRepository.find({
        relations: [
          'translation_language',
          'translation_project_value',
          'translation_project_value.translation_project_key',
          'translation_project',
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteTranslationLanguages(id: number): Promise<any> {
    try {
      await this.translationProjectLanguageRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Translation Language deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTranslationLanguageByProjectId(id: number): Promise<any> {
    try {
      const translationProjectLanguage =
        await this.translationProjectLanguageRepository.find({
          where: {
            translation_project: {
              id: id,
            },
          },
          relations: [
            'translation_language',
            'translation_project_value',
            'translation_project_value.translation_project_key',
            'translation_project',
          ],
        });
      if (!translationProjectLanguage) {
        return {
          status: 500,
          message: 'No translation Project Language Found',
        };
      }
      return translationProjectLanguage;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createDefaultCriteria(
    data: CreateDefaultCriteriaDto[],
  ): Promise<any> {
    try {
      const defaultCriteriaResp: any = [];
      for (let i = 0; i < data.length; i++) {
        const contestCategory = await this.contestCategoryRepository.findOne({
          where: {
            id: data[i].contest_category_id,
          },
        });

        if (!contestCategory) {
          return {
            status: 500,
            message: 'No contest category found.',
          };
        }
        const DcData = new DefaultCriteria();
        DcData.contest_category = contestCategory;
        DcData.title = data[i].title;
        DcData.description = data[i].description;
        DcData.weightage = data[i].weightage;

        await this.defaultCriteriaRepository.save(DcData);
        defaultCriteriaResp.push(DcData);
      }

      return defaultCriteriaResp;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async updateDefaultCriteria(data: any): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const contestCategory = await this.contestCategoryRepository.findOne({
          where: {
            id: data[i].contest_category_id,
          },
        });

        if (!contestCategory) {
          return {
            status: 500,
            message: 'No contest category found.',
          };
        }
        const defaultCriteria = await this.defaultCriteriaRepository.findOne({
          where: {
            id: data[i].id,
          },
        });

        if (!defaultCriteria) {
          return {
            status: 500,
            message: 'No default criteria found.',
          };
        }

        data[i].contest_category = contestCategory;
        delete data[i].contest_category_id;
        await this.defaultCriteriaRepository.update(data[i].id, data[i]);
      }
      const ids = await this.arrayColumn(data, 'id');
      const responseData = await this.defaultCriteriaRepository.find({
        where: {
          id: In(ids),
        },
      });
      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteDefaultCriteria(id: number): Promise<any> {
    try {
      const defaultCriteria = await this.defaultCriteriaRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!defaultCriteria) {
        return {
          status: 500,
          message: 'No default criteria found.',
        };
      }

      await this.defaultCriteriaRepository.delete(id);

      return {
        status: 200,
        message: 'Default criteria deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async defaultCriteriaAllProcess(
    data: DefaultCriteriaAllProcessDto,
  ): Promise<any> {
    try {
      const responseReturn = {
        create_default_criteria: [],
        update_default_criteria: [],
      };
      if (data.create_default_criteria && data.create_default_criteria.length) {
        const response = await this.createDefaultCriteria(
          data.create_default_criteria,
        );
        if (response.status === 500) {
          return response;
        }
        responseReturn.create_default_criteria.push(response);
      }
      if (data.update_default_criteria && data.update_default_criteria.length) {
        const response = await this.updateDefaultCriteria(
          data.update_default_criteria,
        );
        if (response.status === 500) {
          return response;
        }
        responseReturn.update_default_criteria.push(response);
      }
      if (data.delete_default_criteria) {
        for (let i = 0; i < data.delete_default_criteria.length; i++) {
          const response = await this.deleteDefaultCriteria(
            data.delete_default_criteria[i],
          );
          if (response.status === 500) {
            return response;
          }
        }
      }
      return responseReturn;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllDefaultCriteria(): Promise<any> {
    try {
      const contestCategory = await this.defaultCriteriaRepository.find({
        relations: ['contest_category'],
      });

      if (!contestCategory.length) {
        return {
          status: 500,
          message: 'No contest category found.',
        };
      }
      return contestCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getTranslationKeyAndText(data: GetKeyBySearch): Promise<any> {
    try {
      let whereConn: any = {};
      if (data.language_code) {
        whereConn = {
          translation_project: {
            id: data.project_id,
            translation_project_value: {
              translation_project_language: {
                translation_language: {
                  language_code: data.language_code,
                },
              },
            },
          },
        };
      } else {
        whereConn = {
          translation_project: {
            id: data.project_id,
          },
        };
      }

      const relations = [
        'translation_project_value',
        'translation_project_value.translation_project_language',
        'translation_project_value.translation_project_language.translation_language',
      ];

      const translationProjectKey =
        await this.translationProjectKeyRepository.find({
          where: whereConn,
          relations,
        });

      if (!translationProjectKey) {
        return {
          status: 500,
          message: 'No translation project Key found.',
        };
      }

      const response: any = {};

      translationProjectKey.forEach((key) => {
        const translationKey = key.translation_key;
        const translations = key.translation_project_value
          .filter(
            (value) =>
              !data.language_code ||
              value.translation_project_language.translation_language
                .language_code === data.language_code,
          )
          .map((value) => ({
            language_code:
              value.translation_project_language.translation_language
                .language_code,
            translation_value: value.translation_value,
          }));

        if (translations.length > 0) {
          response[translationKey] = translations;
        }
      });

      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getTranslationProjectKeyByTranslationProjectId(
    id: number,
  ): Promise<any> {
    try {
      const translationProject =
        await this.translationProjectKeyRepository.find({
          where: {
            translation_project: {
              id: id,
            },
          },
          relations: [
            'translation_project',
            'translation_project_value',
            'translation_project_value.translation_project_language',
            'translation_project_value.translation_project_language.translation_language',
          ],
        });

      if (!translationProject.length) {
        return {
          status: 500,
          message: 'No Translation Project Key found. ',
        };
      }
      return translationProject;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createAdminNotification(
    data: CreateAdminNotificationDto,
  ): Promise<any> {
    try {
      const newNotification = new AdminNotification();
      newNotification.notification_title = data.notification_title;
      newNotification.notification_content = data.notification_content;
      newNotification.notification_type = data.notification_type;
      const notification =
        await this.adminNotificationRepository.save(newNotification);
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAdminNotification(
    id: number,
    data: UpdateAdminNotificationDto,
  ): Promise<any> {
    try {
      const notification = await this.adminNotificationRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!notification) {
        return {
          status: 500,
          message: 'No notification found.',
        };
      }
      await this.adminNotificationRepository.update({ id: id }, data);
      return {
        status: 200,
        message: 'Notification updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAdminNotification(data: PaginationDto): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      return await this.adminNotificationRepository.find({
        take: data.limit,
        skip,
        order: {
          id: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAdminNotificationById(id: number): Promise<any> {
    try {
      const notification = await this.adminNotificationRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!notification) {
        return {
          status: 500,
          message: 'No notification found.',
        };
      }
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAdminNotificationByType(type: string): Promise<any> {
    try {
      const notification = await this.adminNotificationRepository.findOne({
        where: {
          notification_type: type,
        },
      });
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteAdminNotificationById(id: number): Promise<any> {
    try {
      const notification = await this.adminNotificationRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!notification) {
        return {
          status: 500,
          message: 'No notification found.',
        };
      }
      await this.adminNotificationRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Notification deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createWalkthroughCategory(
    data: CreateWalkthroughCategoryDto[],
  ): Promise<any> {
    try {
      const walkthroughCategoryResp: any = [];
      for (let i = 0; i < data.length; i++) {
        const walkthroughCategoryData = new WalkthroughCategory();
        walkthroughCategoryData.category_name = data[i].category_name;
        walkthroughCategoryData.step = data[i].step;
        const walkthroughCategory =
          await this.walkthroughCategoryRepository.save(
            walkthroughCategoryData,
          );
        walkthroughCategoryResp.push(walkthroughCategory);
      }
      return walkthroughCategoryResp;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWalkthroughCategory(data: any): Promise<any> {
    try {
      for (let i = 0; i < data.length; i++) {
        const walkthroughCategory =
          await this.walkthroughCategoryRepository.findOne({
            where: {
              id: data[i].id,
            },
          });

        if (!walkthroughCategory) {
          return {
            status: 500,
            message: 'No walk through category found.',
          };
        }
        await this.walkthroughCategoryRepository.update(data[i].id, data[i]);
      }
      const ids = await this.arrayColumn(data, 'id');
      const responseData = await this.walkthroughCategoryRepository.find({
        where: {
          id: In(ids),
        },
      });
      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWalkthroughCategory(id: number): Promise<any> {
    try {
      const walkthroughCategory =
        await this.walkthroughCategoryRepository.findOne({
          where: {
            id: id,
          },
        });

      if (!walkthroughCategory) {
        return {
          status: 500,
          message: 'No walk through category found.',
        };
      }
      await this.walkthroughCategoryRepository.delete(id);

      return {
        status: 200,
        message: 'Walk through category deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async createWalkthroughStep(
    data: CreateWalkthroughStepDto,
  ): Promise<any> {
    try {
      const walkthroughCategory =
        await this.walkthroughCategoryRepository.findOne({
          where: {
            id: data.walkthrough_category_id,
          },
        });
      if (!walkthroughCategory) {
        return {
          status: 500,
          message: 'No walkthrough Category found.',
        };
      }
      const walkthroughStep = new WalkthroughStep();
      walkthroughStep.content = data.content;
      walkthroughStep.title = data.title;
      walkthroughStep.walkthrough_type = data.walkthrough_type;
      walkthroughStep.step_name = data.step_name;
      walkthroughStep.walkthrough_category = walkthroughCategory;
      const walkthroughStepData = await this.saveWithOrder(walkthroughStep);
      return walkthroughStepData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateWalkthroughStep(id: number, data: any): Promise<any> {
    try {
      const walkthroughStep = await this.walkthroughStepRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!walkthroughStep) {
        return {
          status: 500,
          message: 'No Walkthrough Step found.',
        };
      }
      if (data.walkthrough_category_id) {
        const walkthroughCategory =
          await this.walkthroughCategoryRepository.findOne({
            where: {
              id: data.walkthrough_category_id,
            },
          });
        if (!walkthroughCategory) {
          return {
            status: 500,
            message: 'No Walkthrough Category found.',
          };
        }
        data.walkthrough_category = walkthroughCategory;
        delete data.walkthrough_category_id;
      }

      await this.walkthroughStepRepository.update({ id: id }, data);
      return {
        status: 200,
        message: 'Walkthrough step updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async walkthroughCategoryAllProcess(
    data: WalkthroughCategoryAllProcessDto,
  ): Promise<any> {
    try {
      const responseReturn = {
        create_walkthrough_category: [],
        update_walkthrough_category: [],
      };
      if (
        data.create_walkthrough_category &&
        data.create_walkthrough_category.length
      ) {
        const response = await this.createWalkthroughCategory(
          data.create_walkthrough_category,
        );
        if (response.status === 500) {
          return response;
        }
        responseReturn.create_walkthrough_category.push(response);
      }

      if (
        data.update_walkthrough_category &&
        data.update_walkthrough_category.length
      ) {
        const response = await this.updateWalkthroughCategory(
          data.update_walkthrough_category,
        );
        if (response.status === 500) {
          return response;
        }
        responseReturn.update_walkthrough_category.push(response);
      }

      if (data.delete_walkthrough_category) {
        for (let i = 0; i < data.delete_walkthrough_category.length; i++) {
          const response = await this.deleteWalkthroughCategory(
            data.delete_walkthrough_category[i],
          );
          if (response.status === 500) {
            return response;
          }
        }
      }
      return responseReturn;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getWalkthroughStep(data: PaginationDto): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const walkthroughStep = this.walkthroughStepRepository.find({
        take: data.limit,
        skip,
        order: {
          id: 'DESC',
        },
        relations: ['walkthrough_category'],
      });
      if (!walkthroughStep) {
        return {
          status: 500,
          message: 'No Walkthrough Step found.',
        };
      }
      return walkthroughStep;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWalkthroughStepById(id: number): Promise<any> {
    try {
      const walkthroughStep = await this.walkthroughStepRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!walkthroughStep) {
        return {
          status: 500,
          message: 'No Walkthrough Step found.',
        };
      }
      await this.walkthroughStepRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Walkthrough Step deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWalkthroughCategory(data: PaginationDto): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const walkthroughCategory = this.walkthroughCategoryRepository.find({
        take: data.limit,
        skip,
        order: {
          id: 'DESC',
        },
        relations: ['walkthrough_step'],
      });
      if (!walkthroughCategory) {
        return {
          status: 500,
          message: 'No Walkthrough Category found.',
        };
      }
      return walkthroughCategory;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteWalkthroughCategoryById(id: number): Promise<any> {
    try {
      const walkthroughCategory =
        await this.walkthroughCategoryRepository.findOne({
          where: {
            id: id,
          },
        });
      if (!walkthroughCategory) {
        return {
          status: 500,
          message: 'No Walkthrough Category found.',
        };
      }
      await this.walkthroughCategoryRepository.delete({ id: id });
      return {
        status: 200,
        message: 'Walkthrough Category deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateWalkthroughStepOrder(data: any): Promise<any> {
    try {
      const base_data = await this.walkthroughStepRepository.findOne({
        where: {
          id: data.base_id,
        },
        relations: ['walkthrough_category'],
      });
      if (!base_data) {
        return {
          status: 500,
          message: 'No base data found.',
        };
      }
      const update_data = await this.walkthroughStepRepository.findOne({
        where: {
          id: data.update_id,
        },
        relations: ['walkthrough_category'],
      });
      if (!update_data) {
        return {
          status: 500,
          message: 'No update data found.',
        };
      }
      if (
        base_data.walkthrough_category.id != update_data.walkthrough_category.id
      ) {
        return {
          status: 500,
          message: 'Category id is different please check your data.',
        };
      }
      const base_order = base_data.order;
      const update_order = update_data.order;

      base_data.order = update_order;
      update_data.order = base_order;

      await this.walkthroughStepRepository.save(base_data);
      await this.walkthroughStepRepository.save(update_data);

      return {
        status: 200,
        message: 'Order updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getWalkthroughCategoryByIdsData(ids: any): Promise<any> {
    try {
      const walkthroughCategory = await this.walkthroughCategoryRepository.find(
        {
          where: {
            id: In(ids),
          },
          relations: ['walkthrough_step'],
        },
      );

      return walkthroughCategory || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllUserNotification(data: any): Promise<any> {
    try {
      const userNotification = await firstValueFrom(
        this.notificationClient.send(
          'get_user_notification',
          JSON.stringify(data),
        ),
      );

      return userNotification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllNotification(data: any): Promise<any> {
    try {
      const userNotification = await firstValueFrom(
        this.notificationClient.send(
          'get_all_notification',
          JSON.stringify(data),
        ),
      );

      return userNotification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteNotification(data: any): Promise<any> {
    try {
      const userNotification = await firstValueFrom(
        this.notificationClient.send(
          'delete_user_notification',
          JSON.stringify(data),
        ),
      );

      return userNotification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteUserAllNotification(data: any): Promise<any> {
    try {
      const userNotification = await firstValueFrom(
        this.notificationClient.send(
          'delete_user_all_notification',
          JSON.stringify(data),
        ),
      );

      return userNotification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserAllNotification(data: any): Promise<any> {
    try {
      const userNotification = await firstValueFrom(
        this.notificationClient.send(
          'update_user_all_notification',
          JSON.stringify(data),
        ),
      );

      return userNotification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateProfile(id: number, data: any): Promise<any> {
    try {
      const new_data: any = { ...data, id };

      const userData = await firstValueFrom(
        this.userClient.send<any>(
          'update_creator_profile',
          JSON.stringify(new_data),
        ),
      );

      return userData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateExpertProfile(id: number, data: any): Promise<any> {
    try {
      const new_data: any = { ...data, id };

      const userData = await firstValueFrom(
        this.userClient.send<any>(
          'update_expert_profile',
          JSON.stringify(new_data),
        ),
      );

      return userData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateInvestorProfile(id: number, data: any): Promise<any> {
    try {
      const new_data: any = { ...data, id };

      const userData = await firstValueFrom(
        this.userClient.send<any>(
          'update_investor_profile',
          JSON.stringify(new_data),
        ),
      );

      return userData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateTeacherProfile(id: number, data: any): Promise<any> {
    try {
      const new_data: any = { ...data, id };

      const userData = await firstValueFrom(
        this.userClient.send<any>(
          'update_teacher_profile',
          JSON.stringify(new_data),
        ),
      );

      return userData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateHubberTeamProfile(
    id: number,
    data: any,
    image: any,
  ): Promise<any> {
    try {
      let avatar;

      if (image) {
        avatar = await this.s3Service.uploadFile(image);
      }

      const new_data: any = data;
      new_data.id = id;
      if (avatar) {
        new_data.avatar = avatar.Location;
      }
      return await firstValueFrom(
        this.userClient.send(
          'update_hubber_team_profile',
          JSON.stringify(new_data),
        ),
      );
    } catch (error) {
      console.log('error--->', error.message);
      throw new InternalServerErrorException(error);
    }
  }
}
