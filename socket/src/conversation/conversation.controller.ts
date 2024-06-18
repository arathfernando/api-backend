import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/core/decorator/user.decorator';
import {
  AddMemberToConversationDto,
  ConversationNameDto,
  CreateConversationDto,
  GetByIdDto,
  GetByUserIdDto,
  PaginationDto,
  SearchDataDto,
} from 'src/core/dtos';
import { SearchChatDto } from 'src/core/dtos/search-chat.dto';
import { ClientAuthGuard } from 'src/core/guards/auth.guard';
import { ConversationService } from './conversation.service';
import { UpdateConversionAdminDto } from 'src/core/dtos/update-conversion_admin.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetByGigIdDto } from 'src/core/dtos/get-by-user-and-gig-id.dto';

@ApiTags('Chat Conversation')
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @MessagePattern('create_conversation')
  public async getPendingNotifications(@Payload() data: any): Promise<any> {
    data = JSON.parse(data);
    return this.conversationService.createConversationMasterClass(
      { members: data.member },
      data.user_id,
      data.message,
      data.conversation_name,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Post()
  public async createConversation(
    @Body(ValidationPipe) data: CreateConversationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.conversationService.createConversation(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id/conversation-name')
  public async updateConversationName(
    @Param() id: GetByIdDto,
    @Body() data: ConversationNameDto,
  ): Promise<any> {
    return this.conversationService.updateConversationName(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get()
  public async getConversations(
    @Query() data: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.conversationService.getConversations(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id')
  public async getConversationById(@Param() id: GetByIdDto): Promise<any> {
    return this.conversationService.getConversationById(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id/messages')
  public async getMessagesByConversationId(
    @Param() id: GetByIdDto,
    @Query() data: PaginationDto,
  ): Promise<any> {
    return this.conversationService.getMessagesByConversationId(id.id, data);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:id/members')
  public async getConversationMembers(@Param() id: GetByIdDto): Promise<any> {
    return this.conversationService.getConversationMembers(id.id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/:user_id/existing-conversation')
  public async getExistingConversation(
    @Param() data: GetByUserIdDto,
    @CurrentUser() user_id: number,
    @Query() gig_id: GetByGigIdDto,
  ): Promise<any> {
    return this.conversationService.getExistingConversation(
      data.user_id,
      user_id,
      gig_id.gig_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/:id/members')
  public async addMemberToConversation(
    @Param() id: GetByIdDto,
    @Body() userId: AddMemberToConversationDto,
  ): Promise<any> {
    return this.conversationService.addMemberToConversation(id.id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id/members')
  public async removeMemberFromConversation(
    @Param() id: GetByIdDto,
    @Body() data: AddMemberToConversationDto,
  ): Promise<any> {
    return this.conversationService.removeMemberFromConversation(
      id.id,
      data.members,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/chat/search')
  public async searchChat(
    @Query() data: SearchChatDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.conversationService.searchChat(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Put('/conversion/update-admin')
  public async updateConversionAdmin(
    @Body() data: UpdateConversionAdminDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.conversationService.updateConversionAdmin(data, user_id);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/meta-data/:search')
  public async getUrlContent(@Param() data: SearchDataDto): Promise<any> {
    return this.conversationService.getUrlContent(data.search);
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Get('/conversion/:search')
  public async searchConversation(
    @Param() data: SearchDataDto,
    @Query() pagination: PaginationDto,
    @CurrentUser() user_id: number,
  ): Promise<any> {
    return this.conversationService.searchConversation(
      data,
      pagination,
      user_id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(ClientAuthGuard)
  @Delete('/:id/conversation')
  public async removeConversationById(@Param() id: GetByIdDto): Promise<any> {
    return this.conversationService.removeConversationById(id.id);
  }
}
