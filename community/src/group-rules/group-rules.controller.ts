import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { CreateGroupRuleDto } from 'src/core/dtos/community-group/create-group-rule.dto';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { GroupRulesService } from './group-rules.service';

@ApiTags('Community Group Rules')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('group-rules')
export class GroupRulesController {
  constructor(private readonly groupRulesService: GroupRulesService) {}

  @Post()
  async createRules(
    @Body(ValidationPipe) data: CreateGroupRuleDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.groupRulesService.createGroupRule(data, user_id);
  }

  @Get('/:id')
  async getRules(@Param() id: GetByIdDto): Promise<any> {
    return await this.groupRulesService.getGroupRules(id.id);
  }

  @Put()
  async updateRule(
    @Body(ValidationPipe) data: CreateGroupRuleDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.groupRulesService.updateGroupRules(data, user_id);
  }
}
