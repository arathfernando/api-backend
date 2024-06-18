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
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/helper/decorator/user.decorator';
import { GetByIdDto, PaginationDto } from 'src/helper/dtos';
import {
  InnovationCategoryDto,
  UpdateInnovationCategoryDto,
} from 'src/helper/dtos/innovation-category.dto';
import {
  ProductCategoryDto,
  UpdateProductCategoryDto,
} from 'src/helper/dtos/product-category.dto';
import { ProductSubCategoryfaqDto } from 'src/helper/dtos/product-subcategory-faq.dto';
import {
  ProductSubCategoryDto,
  UpdateProductSubCategoryDto,
} from 'src/helper/dtos/product-subcategory.dto';
import { AssessmentDto } from 'src/helper/dtos/project-assessment.dto';
import {
  CreateProjectBasicDTO,
  UpdateProjectBasicDTO,
} from 'src/helper/dtos/project-basic.dto';
import { ProjectMemberDto } from 'src/helper/dtos/project-member.dto';
import {
  TechCategoryDto,
  UpdateTechCategoryDto,
} from 'src/helper/dtos/tech-category.dto';
import { UpdateOrderDTO } from 'src/helper/dtos/update-order.dto';
import { ClientAuthGuard } from 'src/helper/guards/auth.guard';
import { ProductLauncherService } from './product-launcher.service';

@ApiTags('Product Launcher')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('/admin/product-launcher')
export class ProductLauncherController {
  constructor(
    private readonly productLauncherService: ProductLauncherService,
  ) {}

  @MessagePattern('get_faq_by_sub_category')
  public async getFaqBySubCategoryId(@Payload() id: number): Promise<any> {
    return this.productLauncherService.getFaqBySubCategoryId(id);
  }

  @MessagePattern('get_sub_category_by_category_id')
  public async getSubCategoryByCategoryId(@Payload() id: number): Promise<any> {
    return this.productLauncherService.getSubCategoryByCategoryId(id);
  }

  @MessagePattern('get_sub_category_by_id')
  public async getSubCategoryById(@Payload() id: number): Promise<any> {
    return this.productLauncherService.getSubCategoryById(id);
  }

  @MessagePattern('get_sub_category_faq_by_id')
  public async getSubCategoryFaqByIdData(@Payload() id: number): Promise<any> {
    return this.productLauncherService.getSubCategoryFaqById(id);
  }

  @MessagePattern('get_product_category_by_id')
  public async getProductCatById(@Payload() id: number): Promise<any> {
    return this.productLauncherService.getProductCategoryById(id);
  }

  @MessagePattern('get_innovation_category_by_ids')
  public async getProductInnovationCatById(
    @Payload() id: number[],
  ): Promise<any> {
    return this.productLauncherService.getInnovationCategoryByIds(id);
  }

  @MessagePattern('get_tech_category_by_ids')
  public async getProductTechCatById(@Payload() id: number[]): Promise<any> {
    return this.productLauncherService.getTechCategoryByIds(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @UseGuards(ClientAuthGuard)
  @Post('/product-category')
  async createProductCategory(
    @UploadedFile() cover: Express.Multer.File,
    @CurrentUser() user: number,
    @Body(ValidationPipe) data: ProductCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.createProductCategory(
      data,
      user,
      cover,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @Put('/product-category/:id')
  async updateProductCategory(
    @Param() id: GetByIdDto,
    @UploadedFile() cover: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateProductCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.updateProductCategory(
      id.id,
      data,
      cover,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/product-category/:id')
  async getProductCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getProductCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-product-category')
  async getAllProductCategory(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.productLauncherService.getAllProductCategory(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/product-category/:id')
  async deleteProductCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.deleteProductCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @Post('/product-subcategory')
  async createProductSubCategory(
    @CurrentUser() user: number,
    @UploadedFile() cover: Express.Multer.File,
    @Body(ValidationPipe) data: ProductSubCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.createProductSubCategory(
      data,
      user,
      cover,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @Put('/product-subcategory/:id')
  async updateProductSubCategory(
    @Param() id: GetByIdDto,
    @UploadedFile() cover: Express.Multer.File,
    @Body(ValidationPipe) data: UpdateProductSubCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.updateProductSubCategory(
      id.id,
      data,
      cover,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/product-subcategory/:id')
  async getProductSubCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getProductSubCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-product-subcategory')
  async getAllProductSubCategory(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.productLauncherService.getAllProductSubCategory(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/product-subcategory/category/:id')
  async getSubCategoryByCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getSubCategoryByCategoryId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/product-subcategory/:id')
  async deleteProductSubCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.deleteProductSubCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/innovation-category')
  async createInnovationCategory(
    @CurrentUser() user: number,
    @Body(ValidationPipe) data: InnovationCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.createInnovationCategory(
      data,
      user,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/innovation-category/:id')
  async updateInnovationCategory(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateInnovationCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.updateInnovationCategory(
      id.id,
      data,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/innovation-category/:id')
  async getInnovationCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getInnovationCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-innovation-category')
  async getAllInnovationCategory(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.productLauncherService.getAllInnovationCategory(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/innovation-category/:id')
  async deleteInnovationCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.deleteInnovationCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/tech-category')
  async createTechCategory(
    @CurrentUser() user: number,
    @Body(ValidationPipe) data: TechCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.createTechCategory(data, user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/tech-category/:id')
  async updateTechCategory(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateTechCategoryDto,
  ): Promise<any> {
    return await this.productLauncherService.updateTechCategory(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/tech-category/:id')
  async getTechCategoryById(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getTechCategoryById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-tech-category')
  async getAllTechCategory(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.productLauncherService.getAllTechCategory(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/tech-category/:id')
  async deleteTechCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.deleteTechCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/product-subcategory-faq')
  async createSubCategoryFaq(
    @CurrentUser() user: number,
    @Body() data: ProductSubCategoryfaqDto,
  ): Promise<any> {
    return await this.productLauncherService.createSubCategoryFaq(data, user);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/product-subcategory-faq/:id')
  async updateSubCategoryFaq(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: ProductSubCategoryfaqDto,
  ): Promise<any> {
    return await this.productLauncherService.updateSubCategoryFaq(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/product-subcategory-faq/:id')
  async getSubCategoryFaqById(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getSubCategoryFaqById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/all-product-subcategory-faq')
  async getAllProductSubCategoryFaq(
    @Query(ValidationPipe) data: PaginationDto,
  ): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    return await this.productLauncherService.getAllProductSubCategoryFaq(newD);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/product-subcategory-faq/category/:id')
  async getSubCategoryFaqByCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getSubCategoryFaqByCategory(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/product-subcategory-faq/subcategory/:id')
  async getSubCategoryFaqBySubCategory(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getSubCategoryFaqBySubCategory(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/product-subcategory-faq/:id')
  async deleteSubCategoryFaq(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.deleteSubCategoryFaq(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/project')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('project_image'))
  async createProject(
    @UploadedFile() project_image: Express.Multer.File,
    @Body(ValidationPipe) data: CreateProjectBasicDTO,
  ): Promise<any> {
    return await this.productLauncherService.createProject(data, project_image);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('project_image'))
  @Put('/project/:id')
  async updateProject(
    @UploadedFile() project_image: Express.Multer.File,
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: UpdateProjectBasicDTO,
  ): Promise<any> {
    return await this.productLauncherService.updateProject(
      data,
      id.id,
      project_image,
    );
  }

  @Get('/project')
  async getAllProject(@Query() data: PaginationDto): Promise<any> {
    return await this.productLauncherService.getAllProject(data);
  }

  @Get('/project/:id')
  async getProjectById(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getProjectById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/project/:id')
  async deleteProject(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.deleteProject(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/project/assessment')
  async addProjectAssessment(
    @Body(ValidationPipe) data: AssessmentDto,
  ): Promise<any> {
    return await this.productLauncherService.addProjectAssessment(data);
  }

  @Get('/project/assessment/project/:id')
  async getProjectAssessmentByProjectId(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getProjectAssessmentByProjectId(
      id.id,
    );
  }

  @Get('/project/assessment/sub-category/:id')
  async getProjectAssessmentBySubCategoryId(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.productLauncherService.getProjectAssessmentBySubCategoryId(
      id.id,
    );
  }

  @Get('/project/assessment/category/:id')
  async getProjectAssessmentByCategoryId(
    @Param() id: GetByIdDto,
  ): Promise<any> {
    return await this.productLauncherService.getProjectAssessmentByCategoryId(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/project/project-member')
  async addProjectMember(
    @Body(ValidationPipe) data: ProjectMemberDto,
  ): Promise<any> {
    return await this.productLauncherService.addProjectMember(data);
  }

  @Get('/project-member/project/:id')
  async getProjectMemberByProjectId(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.getProjectMemberByProjectId(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/project/project-member/:id')
  async deleteProjectMemberByProjectId(@Param() id: GetByIdDto): Promise<any> {
    return await this.productLauncherService.deleteProjectMemberByProjectId(
      id.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/project-member/:id')
  async getProjectMemberById(
    @Param(ValidationPipe) id: GetByIdDto,
  ): Promise<any> {
    return await this.productLauncherService.getProjectMemberById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post('/order')
  async changeOrder(@Body(ValidationPipe) data: UpdateOrderDTO): Promise<any> {
    return await this.productLauncherService.updateOrder(data);
  }
}
