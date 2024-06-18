import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AllowUnauthorizedRequest } from 'src/helper/decorator/allow.unauthorized.decorator';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import {
  CourseCategoryDto,
  CreateAdminArticleDto,
  CreateBadgeDto,
  CreateContestCategoryDto,
  CreateGoalDto,
  CreateModuleTypeDto,
  CreatePartnerTypeDto,
  CreateTranslationLanguageDto,
  CreateTranslationProjectLanguageDto,
  GetByIdDto,
  GetKeyBySearch,
  PaginationDto,
  UpdateAdminArticleDto,
  UpdateBadgeDto,
  UpdateBasicTypeDto,
  UpdateContestCategoryDto,
  UpdateCourseCategoryDto,
  UpdateGoalDto,
  UpdateLanguageDto,
  UpdateLanguageLevelDto,
  UpdateModuleTypeDto,
  UpdatePartnerTypeDto,
  UpdateSocialDto,
  UpdateTranslationLanguageDto,
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
import { UpdateCountryDto } from 'src/helper/dtos/update-country.dto';
import { UpdateCurrencyDto } from 'src/helper/dtos/update-currency.dto';
import { UpdateExpertiseCategoryDto } from 'src/helper/dtos/update-expertise-category.dto';
import { UpdateTimezoneDto } from 'src/helper/dtos/update-timezone.dto';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { IBasicLanguage } from 'src/helper/interfaces';
import { AdminOptionsService } from './admin-options.service';
import {
  CreateNationalityDto,
  UpdateNationalityDto,
} from 'src/helper/dtos/nationality.dto';
import {
  CreateAdminRoleDto,
  UpdateAdminRoleDto,
} from 'src/helper/dtos/create-role.dto';
import {
  CreatePromptTypeDto,
  UpdatePromptTypeDto,
} from 'src/helper/dtos/prompt-type.dto.';
import { CreatePromptDto, UpdatePromptDto } from 'src/helper/dtos/prompt.dto.';
import {
  CreateTranslationProjectDto,
  UpdateTranslationProjectDto,
} from 'src/helper/dtos/translation-project.dto';
import {
  CreateTranslationProjectKeyDto,
  UpdateTranslationProjectKeyDto,
} from 'src/helper/dtos/translation-project-key.dto';
import {
  CreateTranslationProjectValueDto,
  UpdateTranslationProjectValueDto,
} from 'src/helper/dtos/translation-project-value.dto';
import { DefaultCriteriaAllProcessDto } from 'src/helper/dtos/default-criteria.dto';
import {
  CreateAdminNotificationDto,
  UpdateAdminNotificationDto,
} from 'src/helper/dtos/admin-notification.dto';
import { WalkthroughCategoryAllProcessDto } from 'src/helper/dtos/default-walk-through.dto';
import {
  CreateWalkthroughStepDto,
  UpdateWalkthroughStepDto,
} from 'src/helper/dtos/walkthrough-step.dto';
import { UpdateWalkthroughStepOrderDto } from 'src/helper/dtos/update-walkthrough-step-order.dto';
import { UpdateCreatorDto } from 'src/helper/dtos/creator.dto';
import { UpdateExpertDto } from 'src/helper/dtos/expert.dto';
import { UpdateTeacherDto } from 'src/helper/dtos/teacher.dto';
import { UpdateInvestorDto } from 'src/helper/dtos/investor.dto';
import { UserUpdateHubbersTeamProfileDto } from 'src/helper/dtos/user-hubbers-team-profile.dto';

@ApiTags('Admin Options')
@Controller('/admin')
export class AdminOptionsController {
  constructor(private readonly adminOptionsService: AdminOptionsService) {}

  @MessagePattern('get_media')
  public async getMediaData(@Payload() data): Promise<any> {
    return this.adminOptionsService.getSocialById(data);
  }

  @MessagePattern('get_basic_type_category')
  public async getBasicTypeCateData(@Payload() data: any): Promise<any> {
    return this.adminOptionsService.getBasicTypeCategoryById(data);
  }

  @MessagePattern('get_basic_type')
  public async getBasicTypeData(@Payload() data: { id: number }): Promise<any> {
    return this.adminOptionsService.getBasicTypeById(data.id);
  }

  @MessagePattern('get_basic_type_ids')
  public async getBasicTypeFromIdsData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.adminOptionsService.getBasicTypeByIds(data);
  }

  @MessagePattern('get_country_by_id')
  public async getCountryData(@Payload() id: number): Promise<any> {
    return this.adminOptionsService.getCountryById(id);
  }

  @MessagePattern('get_language_by_id')
  public async getLanguageData(@Payload() data: { id: number }): Promise<any> {
    return this.adminOptionsService.getLanguageById(data.id);
  }

  @MessagePattern('get_language_by_code')
  public async getLanguageDataByCode(@Payload() code: string): Promise<any> {
    return this.adminOptionsService.getLanguageByCode(code);
  }

  @MessagePattern('get_expertise_by_id')
  public async getExpertiseById(@Payload() data: { id: number }): Promise<any> {
    return this.adminOptionsService.getExpertiseCategoryById(data.id);
  }

  @MessagePattern('get_currency_by_id')
  public async getCurrency(@Payload() data: { id: number }): Promise<any> {
    return this.adminOptionsService.getCurrencyById(data.id);
  }

  @MessagePattern('get_badge_by_id')
  public async getBadgeData(@Payload() id: number): Promise<any> {
    return this.adminOptionsService.getBadgeById(id);
  }

  @MessagePattern('get_all_goals')
  public async getAllGoalsData(): Promise<any> {
    return this.adminOptionsService.getGoals();
  }

  @MessagePattern('get_goal_by_id')
  public async getGoalData(@Payload() id: number): Promise<any> {
    return this.adminOptionsService.getGoalById(id);
  }

  @MessagePattern('get_goal_by_ids')
  public async getGoalByIdsData(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.adminOptionsService.getGoalByIdsData(data);
  }

  @MessagePattern('get_all_contest_categories')
  public async getAllContestCategories(): Promise<any> {
    return this.adminOptionsService.getContestCategories();
  }

  @MessagePattern('get_contest_category_by_id')
  public async getContestCategoryData(@Payload() id: number): Promise<any> {
    return this.adminOptionsService.getContestCategoryById(id);
  }

  @MessagePattern('get_partner_type_by_id')
  public async getPartnerTypeByIdData(@Payload() id: number): Promise<any> {
    return this.adminOptionsService.getPartnerTypeById(id);
  }
  @MessagePattern('get_course_category_by_id')
  public async getCourseCategory(@Payload() id: number): Promise<any> {
    return this.adminOptionsService.getCourseCategoryById(id);
  }

  @MessagePattern('get_notification_by_type')
  public async getNotificationBYtype(@Payload() type: string): Promise<any> {
    return this.adminOptionsService.getAdminNotificationByType(type);
  }

  @MessagePattern('get_walkthrough_category_by_ids')
  public async getWalkthroughCategoryByIdsData(
    @Payload() data: any,
  ): Promise<any> {
    data = JSON.parse(data);
    return this.adminOptionsService.getWalkthroughCategoryByIdsData(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/basic-type-category')
  async createBasicTypeCategory(
    @CurrentUser() user: number,
    @Body(ValidationPipe) data: BasicTypeCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.createBasicTypeCategory(data, user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/basic-type-category/:id')
  async updateBasicTypeCategory(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: BasicTypeCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateBasicTypeCategory(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/basic-type-category')
  async getBasicTypeCategory(): Promise<any> {
    return await this.adminOptionsService.getBasicTypeCategory();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/basic-type-category/:id')
  async getBasicTypeCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getBasicTypeCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/basic-type-category/:id')
  async deleteBasicTypeCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteBasicTypeCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('/options/basic-type')
  async createBasicType(
    @UploadedFile() image: Express.Multer.File,
    @CurrentUser() user: number,
    @Body(ValidationPipe) data: BasicTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.createBasicType(image, data, user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Put('/options/basic-type/:id')
  async updateBasicType(
    @UploadedFile() image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateBasicTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateBasicType(image, id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/basic-type')
  async getBasicType(): Promise<any> {
    return await this.adminOptionsService.getBasicType();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/basic-type/category/:id')
  async getBasicTypeByCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getBasicTypeByCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/basic-type/:id')
  async getBasicTypeById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getBasicTypeById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/basic-type/:id')
  async deleteBasicType(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteBasicType(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('icon'))
  @Post('/options/expertise-category')
  async createExpertiseCategory(
    @UploadedFile() icon: Express.Multer.File,
    @Body(ValidationPipe) data: ExpertiseCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.createExpertiseCategory(icon, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('icon'))
  @Put('/options/expertise-category/:id')
  async updateExpertiseCategory(
    @UploadedFile() icon: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateExpertiseCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateExpertiseCategory(
      icon,
      id.id,
      data,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/expertise-category')
  async getExpertiseCategory(): Promise<any> {
    return await this.adminOptionsService.getExpertiseCategory();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/expertise-category/:id')
  async getExpertiseCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getExpertiseCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/expertise-category/:id')
  async deleteExpertiseCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteExpertiseCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/language')
  async createLanguage(
    @CurrentUser() user: number,
    @Body(ValidationPipe) data: LanguageDto,
  ): Promise<IBasicLanguage> {
    return await this.adminOptionsService.createLanguage(data, user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/add-default-language')
  async addDefaultLanguages(): Promise<any> {
    return await this.adminOptionsService.addDefaultLanguages();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/language/:id')
  async updateLanguage(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateLanguageDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateLanguage(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/language')
  async getLanguages(): Promise<any> {
    return await this.adminOptionsService.getLanguages();
  }

  @Get('/open/options/language')
  async getOpenLanguages(): Promise<any> {
    return await this.adminOptionsService.getLanguages();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/language/:id')
  async getLanguageById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getLanguageById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/language/:id')
  async deleteLanguage(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteLanguage(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/language-level')
  async createLanguageLevel(
    @CurrentUser() user: number,
    @Body(ValidationPipe) data: LanguageLevelDto,
  ): Promise<any> {
    return await this.adminOptionsService.createLanguageLevel(data, user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/language-level/:id')
  async updateLanguageLevel(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateLanguageLevelDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateLanguageLevel(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/language-level')
  async getLanguageLevels(): Promise<any> {
    return await this.adminOptionsService.getLanguageLevels();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/language-level/:id')
  async getLanguageLevelById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getLanguageLevelById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/language-level/:id')
  async deleteLanguageLevel(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteLanguageLevel(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/country')
  async createCountry(@Body(ValidationPipe) data: CountryDto): Promise<any> {
    return await this.adminOptionsService.createCountry(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/add-default-countries')
  async addDefaultCountries(): Promise<any> {
    return await this.adminOptionsService.addDefaultCountries();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/country/:id')
  async updateCountry(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCountryDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateCountry(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/country')
  async getCountries(): Promise<any> {
    return await this.adminOptionsService.getCountries();
  }

  @Get('/open/options/country')
  async getOpenCountries(): Promise<any> {
    return await this.adminOptionsService.getCountries();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/country/:id')
  async getCountryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getCountryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/country/:id')
  async deleteCountry(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteCountry(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/add-default-currency')
  async addDefaultCurrency(): Promise<any> {
    return await this.adminOptionsService.addDefaultCurrency();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/currency')
  async createCurrency(@Body(ValidationPipe) data: CurrencyDto): Promise<any> {
    return await this.adminOptionsService.createCurrency(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/currency/:id')
  async updateCurrency(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCurrencyDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateCurrency(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/currency')
  async getCurrencies(): Promise<any> {
    return await this.adminOptionsService.getCurrencies();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/currency/:id')
  async getCurrencyById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getCurrencyById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/currency/:id')
  async deleteCurrency(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteCurrency(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/timezone')
  async createTimezone(@Body(ValidationPipe) data: TimezoneDto): Promise<any> {
    return await this.adminOptionsService.createTimezone(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/add-default-timezone')
  async addDefaultTimezone(): Promise<any> {
    return await this.adminOptionsService.addDefaultTimezone();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/timezone/:id')
  async updateTimezone(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateTimezoneDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateTimezone(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/timezone')
  async getTimezones(): Promise<any> {
    return await this.adminOptionsService.getTimezones();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/timezone/:id')
  async getTimezoneById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getTimezoneById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/timezone/:id')
  async deleteTimezone(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteTimezone(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('/options/social')
  async createSocial(
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe) data: SocialDto,
  ): Promise<any> {
    return await this.adminOptionsService.createSocial(image, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Put('/options/social/:id')
  async updateSocial(
    @UploadedFile() image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateSocialDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateSocial(image, id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/social')
  async getSocials(): Promise<any> {
    return await this.adminOptionsService.getSocials();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/social/:id')
  async getSocialById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getSocialById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/social/:id')
  async deleteSocial(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteSocial(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/prompt-type')
  async createPromptType(
    @Body(ValidationPipe) data: CreatePromptTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.createPromptType(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/prompt-type/:id')
  async updatePromptType(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdatePromptTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.updatePromptType(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/prompt-type')
  async getPromptType(@Query() data: PaginationDto): Promise<any> {
    return await this.adminOptionsService.getPromptType(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/prompt-type/:id')
  async getPromptTypeById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getPromptTypeById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/prompt-type/:id')
  async deletePromptType(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deletePromptType(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/prompt')
  async createPrompt(
    @Body(ValidationPipe) data: CreatePromptDto,
  ): Promise<any> {
    return await this.adminOptionsService.createPrompt(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/prompt/:id')
  async updatePrompt(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdatePromptDto,
  ): Promise<any> {
    return await this.adminOptionsService.updatePrompt(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/prompt')
  async getPrompt(@Query() data: PaginationDto): Promise<any> {
    return await this.adminOptionsService.getPrompt(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/prompt/:id')
  async getPromptById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getPromptById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/prompt/:id')
  async deletePrompt(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deletePrompt(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('goal_image'))
  @Post('/options/goal')
  async createGoal(
    @Body(ValidationPipe) data: CreateGoalDto,
    @UploadedFile() goal_image: Express.Multer.File,
  ): Promise<any> {
    return await this.adminOptionsService.createGoal(goal_image, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('goal_image'))
  @Put('/options/goal/:id')
  async updateGoal(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateGoalDto,
    @UploadedFile() goal_image: Express.Multer.File,
  ): Promise<any> {
    return await this.adminOptionsService.updateGoal(id.id, goal_image, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/goals')
  async getGoals(): Promise<any> {
    return await this.adminOptionsService.getGoals();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/goal/:id')
  async getGoalById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getGoalById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/goal/:id')
  async deleteGoal(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteGoal(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('badge_image'))
  @Post('/options/badge')
  async createBadge(
    @UploadedFile() badge_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateBadgeDto,
  ): Promise<any> {
    return await this.adminOptionsService.createBadge(badge_image, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('badge_image'))
  @Put('/options/badge/:id')
  async updateBadge(
    @UploadedFile() badge_image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateBadgeDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateBadge(badge_image, id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/badges')
  async getBadges(): Promise<any> {
    return await this.adminOptionsService.getBadges();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/badge/:id')
  async getBadgeById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getBadgeById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/badge/:id')
  async deleteBadge(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteBadge(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('flag'))
  @Post('/options/translation-language')
  async createTranslationLanguage(
    @UploadedFile() flag: Express.Multer.File,
    @Body(ValidationPipe) data: CreateTranslationLanguageDto,
  ): Promise<any> {
    return await this.adminOptionsService.createTranslationLanguage(flag, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('flag'))
  @Put('/options/translation-language/:id')
  async updateTranslationLanguage(
    @UploadedFile() flag: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateTranslationLanguageDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateTranslationLanguage(
      flag,
      id.id,
      data,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-language')
  async getTranslationLanguages(): Promise<any> {
    return await this.adminOptionsService.getTranslationLanguages();
  }

  @Get('/options/open/translation-language')
  async getOpenTranslationLanguages(): Promise<any> {
    return await this.adminOptionsService.getTranslationLanguages();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-language/:id')
  async getTranslationLanguageById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getTranslationLanguageById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/translation-language/:id')
  async deleteTranslationLanguage(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteTranslationLanguage(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('/options/contest-category')
  async createContestCategory(
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateContestCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.createContestCategory(image, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Put('/options/contest-category/:id')
  async updateContestCategory(
    @UploadedFile() image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateContestCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateContestCategory(
      image,
      id.id,
      data,
    );
  }

  @AllowUnauthorizedRequest()
  @Get('/options/contest-category')
  async getContestCategories(): Promise<any> {
    return await this.adminOptionsService.getContestCategories();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/contest-category/:id')
  async getContestCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getContestCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/contest-category/:id')
  async deleteContestCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteContestCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/partner-type')
  async createPartnerType(
    @Body(ValidationPipe) data: CreatePartnerTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.createPartnerType(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/partner-type/:id')
  async updatePartnerType(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdatePartnerTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.updatePartnerType(id.id, data);
  }

  @ApiBearerAuth()
  @Get('/options/partner-type')
  async getPartnerType(): Promise<any> {
    return await this.adminOptionsService.getPartnerType();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/partner-type/:id')
  async getPartnerTypeById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getPartnerTypeById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/partner-type/:id')
  async deletePartnerType(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deletePartnerType(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('/options/module-type')
  async createModuleType(
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateModuleTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.createModuleType(image, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Put('/options/module-type/:id')
  async updateModuleType(
    @UploadedFile() image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateModuleTypeDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateModuleType(image, id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @AllowUnauthorizedRequest()
  @Get('/options/module-type')
  async getAllModuleType(): Promise<any> {
    return await this.adminOptionsService.getAllModuleType();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/module-type/:id')
  async getModuleTypeById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getModuleTypeById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/module-type/:id')
  async deleteModuleType(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteModuleType(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/course-category')
  async createCourseCategory(
    @Body(ValidationPipe) data: CourseCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.createCourseCategory(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/course-category/:id')
  async updateCourseCategory(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCourseCategoryDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateCourseCategory(id.id, data);
  }

  @ApiBearerAuth()
  @Get('/options/course-category')
  async getCourseCategories(): Promise<any> {
    return await this.adminOptionsService.getCourseCategories();
  }

  @Get('/options/open/course-category')
  async getOpenCourseCategories(): Promise<any> {
    return await this.adminOptionsService.getCourseCategories();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/course-category/:id')
  async getCourseCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getCourseCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/course-category/:id')
  async deleteCourseCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteCourseCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('/options/article')
  async createArticle(
    @UploadedFile() image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateAdminArticleDto,
  ): Promise<any> {
    return await this.adminOptionsService.createArticle(data, image);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Put('/options/article/:id')
  async updateArticle(
    @UploadedFile() image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateAdminArticleDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateArticle(image, id.id, data);
  }

  @ApiBearerAuth()
  @Get('/options/article')
  async getArticle(@Query() data: PaginationDto): Promise<any> {
    return await this.adminOptionsService.getArticle(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('options/article/:id')
  async getArticleById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getArticleById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('options/article/:id')
  async deleteArticle(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteArticle(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/nationality')
  async createNationality(
    @Body(ValidationPipe) data: CreateNationalityDto,
  ): Promise<any> {
    return await this.adminOptionsService.createNationality(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/nationality/:id')
  async updateNationality(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateNationalityDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateNationality(id.id, data);
  }

  @ApiBearerAuth()
  @Get('/options/nationality')
  async getNationalities(): Promise<any> {
    return await this.adminOptionsService.getNationalities();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/nationality/:id')
  async getNationalityById(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getNationalityById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/nationality/:id')
  async deleteNationality(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteNationality(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/add-default-nationality')
  async addDefaultNationality(): Promise<any> {
    return await this.adminOptionsService.addDefaultNationalities();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/admin-role')
  async createAdminRole(@Body() data: CreateAdminRoleDto): Promise<any> {
    return await this.adminOptionsService.createAdminRole(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/admin-role/:id')
  async updateAdminRole(
    @Param() id: GetByIdDto,
    @Body() data: UpdateAdminRoleDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateAdminRole(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/admin-role')
  async getAllAdminRole(): Promise<any> {
    return await this.adminOptionsService.getAllAdminRole();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/admin-role/:id')
  async getAdminRole(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getAdminRole(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/admin-role/:id')
  async deleteAdminRole(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteAdminRole(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/translation-project/add-all-translation')
  async addAllTranslation(@Body() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.addAutoTranslation(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/translation-project')
  async createTranslationProject(
    @Body() data: CreateTranslationProjectDto,
  ): Promise<any> {
    return await this.adminOptionsService.createTranslationProject(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/translation-project/:id')
  async updateTranslationProject(
    @Param() id: GetByIdDto,
    @Body() data: UpdateTranslationProjectDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateTranslationProject(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-project')
  async getAllTranslationProject(): Promise<any> {
    return await this.adminOptionsService.getAllTranslationProject();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/translation-project/:id')
  async deleteTranslationProject(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteTranslationProject(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/translation-project-language')
  async createTranslationLanguages(
    @Body() data: CreateTranslationProjectLanguageDto,
  ): Promise<any> {
    return await this.adminOptionsService.createTranslationLanguages(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/translation-project-language/:id')
  async updateTranslationLanguages(
    @Param() id: GetByIdDto,
    @Body() data: CreateTranslationProjectLanguageDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateTranslationLanguages(
      id.id,
      data,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-project-language')
  async getAllTranslationLanguages(): Promise<any> {
    return await this.adminOptionsService.getAllTranslationLanguages();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/translation-project-language/:id')
  async deleteTranslationLanguages(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteTranslationLanguages(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-project-language/project/:id')
  async getTranslationLanguageByProjectId(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.adminOptionsService.getTranslationLanguageByProjectId(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/translation-project-key')
  async createTranslationKey(
    @Body() data: CreateTranslationProjectKeyDto,
  ): Promise<any> {
    return await this.adminOptionsService.createTranslationKey(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/translation-project-key/:id')
  async updateTranslationKey(
    @Param() id: GetByIdDto,
    @Body() data: UpdateTranslationProjectKeyDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateTranslationKey(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-project-key')
  async getAllTranslationKey(): Promise<any> {
    return await this.adminOptionsService.getAllTranslationKey();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-project-key/translation-project/:id')
  async getTranslationProjectKeyByTranslationProjectId(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.adminOptionsService.getTranslationProjectKeyByTranslationProjectId(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/translation-project-key/:id')
  async deleteTranslationKey(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteTranslationKey(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/translation-project-value')
  @ApiBody({
    type: CreateTranslationProjectValueDto,
    isArray: true,
  })
  async createTranslationValue(
    @Body() data: CreateTranslationProjectValueDto[],
  ): Promise<any> {
    return await this.adminOptionsService.createTranslationValue(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/translation-project-value/:id')
  @ApiBody({
    type: UpdateTranslationProjectValueDto,
    isArray: true,
  })
  async updateTranslationValue(
    @Body() data: UpdateTranslationProjectValueDto[],
  ): Promise<any> {
    return await this.adminOptionsService.updateTranslationValue(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-project-value')
  async getAllTranslationValue(): Promise<any> {
    return await this.adminOptionsService.getAllTranslationValue();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/translation-project-value/:id')
  async deleteTranslationValue(@Param() id: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteTranslationValue(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/translation-key/translation-text/')
  async getTranslationKeyAndText(@Query() data: GetKeyBySearch): Promise<any> {
    return this.adminOptionsService.getTranslationKeyAndText(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/default-criteria/:id')
  async deleteDefaultCriteria(@Param() id: GetByIdDto): Promise<any> {
    return this.adminOptionsService.deleteDefaultCriteria(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/default-criteria')
  @ApiBody({ type: DefaultCriteriaAllProcessDto })
  async defaultCriteriaAllProcess(
    @Body(ValidationPipe) data: DefaultCriteriaAllProcessDto,
  ): Promise<any> {
    return await this.adminOptionsService.defaultCriteriaAllProcess(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/default-criteria/contest-category')
  async getAllDefaultCriteria(): Promise<any> {
    return await this.adminOptionsService.getAllDefaultCriteria();
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/admin-notification')
  async addAdminNotification(
    @Body(ValidationPipe) data: CreateAdminNotificationDto,
  ): Promise<any> {
    return await this.adminOptionsService.createAdminNotification(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/admin-notification/:id')
  async updateAdminNotification(
    @Body(ValidationPipe) data: UpdateAdminNotificationDto,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateAdminNotification(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/admin-notification')
  async getAdminNotification(@Query() data: PaginationDto): Promise<any> {
    return await this.adminOptionsService.getAdminNotification(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/admin-notification/:id')
  async getAdminNotificationById(@Param() data: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.getAdminNotificationById(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/admin-notification/:id')
  async deleteAdminNotificationById(@Param() data: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteAdminNotificationById(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/walkthrough-category')
  @ApiBody({ type: WalkthroughCategoryAllProcessDto })
  async walkthroughCategoryAllProcess(
    @Body(ValidationPipe) data: WalkthroughCategoryAllProcessDto,
  ): Promise<any> {
    return await this.adminOptionsService.walkthroughCategoryAllProcess(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/walkthrough-category')
  async getWalkthroughCategory(@Query() data: PaginationDto): Promise<any> {
    return await this.adminOptionsService.getWalkthroughCategory(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/walkthrough-category/:id')
  async deleteWalkthroughCategoryById(@Param() data: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteWalkthroughCategoryById(
      data.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/options/walkthrough-step')
  async createWalkthroughStep(
    @Body(ValidationPipe) data: CreateWalkthroughStepDto,
  ): Promise<any> {
    return await this.adminOptionsService.createWalkthroughStep(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/walkthrough-step/:id')
  async updateWalkthroughStep(
    @Body(ValidationPipe) data: UpdateWalkthroughStepDto,
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.adminOptionsService.updateWalkthroughStep(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/walkthrough-step')
  async getWalkthroughStep(@Query() data: PaginationDto): Promise<any> {
    return await this.adminOptionsService.getWalkthroughStep(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/walkthrough-step-order')
  async updateWalkthroughOrder(
    @Body(ValidationPipe) data: UpdateWalkthroughStepOrderDto,
  ): Promise<any> {
    return this.adminOptionsService.updateWalkthroughStepOrder(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/walkthrough-step/:id')
  async deleteWalkthroughStepById(@Param() data: GetByIdDto): Promise<any> {
    return await this.adminOptionsService.deleteWalkthroughStepById(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/user/notification')
  public async getAllUserNotification(
    @Query() data: PaginationDto,
  ): Promise<any> {
    return this.adminOptionsService.getAllUserNotification(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/options/all/notification')
  public async getAllNotification(@Query() data: PaginationDto): Promise<any> {
    return this.adminOptionsService.getAllNotification(data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/user/notification')
  public async deleteUserAllNotification(): Promise<any> {
    return this.adminOptionsService.deleteUserAllNotification(0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/options/user/notification')
  async updateUserAllNotification(): Promise<any> {
    return this.adminOptionsService.updateUserAllNotification(0);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/options/user/notification/:id')
  public async deleteNotification(@Param() data: GetByIdDto): Promise<any> {
    return this.adminOptionsService.deleteNotification(data.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/profile/creator/profile/:id')
  async updateProfile(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateCreatorDto,
  ): Promise<any> {
    return this.adminOptionsService.updateProfile(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/profile/expert/profile/:id')
  async updateExpertProfile(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateExpertDto,
  ): Promise<any> {
    return this.adminOptionsService.updateExpertProfile(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/profile/investor/profile/:id')
  async updateInvestorProfile(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateInvestorDto,
  ): Promise<any> {
    return this.adminOptionsService.updateInvestorProfile(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/profile/teacher/profile/:id')
  async updateTeacherProfile(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateTeacherDto,
  ): Promise<any> {
    return this.adminOptionsService.updateTeacherProfile(id.id, data);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/profile/hubber-team/profile/:id')
  async updateHubberTeamProfile(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UserUpdateHubbersTeamProfileDto,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<any> {
    return this.adminOptionsService.updateHubberTeamProfile(
      id.id,
      data,
      avatar,
    );
  }
}
