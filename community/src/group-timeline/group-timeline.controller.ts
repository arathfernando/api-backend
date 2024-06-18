import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { PostReactionDto } from 'src/core/dtos/post/post-reaction.dto';
import { TimelineFiltersDto } from 'src/core/dtos/timeline-filters.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { GroupTimelineService } from './group-timeline.service';

@ApiTags('Community Group Timeline')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('group-timeline')
export class GroupTimelineController {
  constructor(private readonly groupTimelineService: GroupTimelineService) {}

  @Get('/:id')
  async getPost(
    @Query() data: TimelineFiltersDto,
    @Param(ValidationPipe) id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.groupTimelineService.getTimeline(id.id, data, user_id);
  }

  @Post('/post/reaction/:id')
  async postReaction(
    @Param() id: GetByIdDto,
    @Body(ValidationPipe) data: PostReactionDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.groupTimelineService.postReaction(id.id, data, user_id);
  }
}
