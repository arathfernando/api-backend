import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import { GetByIdDto } from 'src/core/dtos/get-by-id.dto';
import { AnswerPollDto } from 'src/core/dtos/poll/answer-poll.dto';
import { CreatePollDto } from 'src/core/dtos/poll/create-poll.dto';
import { UpdatePollDto } from 'src/core/dtos/poll/update-poll.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { PollService } from './poll.service';

@ApiTags('Community Poll')
@ApiBearerAuth()
@UseGuards(ClientAuthGuard)
@Controller('community-poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  async createPoll(
    @Body() data: CreatePollDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.pollService.createPoll(data, user_id);
  }

  @Post('/answer/:id')
  async answerPoll(
    @Param() id: GetByIdDto,
    @Body() data: AnswerPollDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.pollService.answerPoll(id.id, data, user_id);
  }

  @Put('/:id')
  async updatePoll(
    @Param() id: GetByIdDto,
    @Body() data: UpdatePollDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.pollService.updatePoll(id.id, data, user_id);
  }

  @Get('/:id')
  async getPost(@Param() id: GetByIdDto): Promise<any> {
    return await this.pollService.getPollById(id.id);
  }

  @Delete('/:id')
  async deletePost(
    @Param() id: GetByIdDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return await this.pollService.deletePoll(id.id, user_id);
  }
}
