import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  CONVERSATION_TYPE,
  SEEN_UNSEEN,
} from 'src/core/constant/enum.constant';
import {
  AddMemberToConversationDto,
  ConversationNameDto,
  CreateConversationDto,
  PaginationDto,
} from 'src/core/dtos';
import { SearchChatDto } from 'src/core/dtos/search-chat.dto';
import { UpdateConversionAdminDto } from 'src/core/dtos/update-conversion_admin.dto';
import { Chat, Conversation } from 'src/database/entities';
import { In, Repository } from 'typeorm';

@Injectable()
export class ConversationService {
  constructor(
    @Inject('USER_SERVICE') private readonly userProxy: ClientProxy,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  public async createMessage(
    conversationId: number,
    senderId: number,
    message: string,
  ): Promise<any> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: {
          id: conversationId,
        },
      });
      if (!conversation) {
        return {
          status: 500,
          message: 'NO conversation found.',
        };
      }
      const chat = new Chat();
      chat.sender = senderId;
      chat.message = message;
      chat.conversation = conversation;
      await this.chatRepository.save(chat);

      conversation.last_message_sent = chat;
      await this.conversationRepository.save(conversation);
      for (let i = 0; i < conversation.members.length; i++) {
        await firstValueFrom(
          this.userProxy.send(
            'update_user_chat_status',
            conversation.members[i],
          ),
        );
      }

      const returnChat = await this.chatRepository.findOne({
        where: {
          id: chat.id,
        },
        relations: ['conversation'],
      });

      if (returnChat) {
        if (returnChat.conversation.members.length > 0) {
          if (returnChat.sender) {
            const sender = await this.getUserData(returnChat.sender);
            if (sender.id) {
              returnChat.sender = sender;
            }
          }

          const members = [];

          for (let j = 0; j < returnChat.conversation.members.length; j++) {
            const member = await this.getUserData(
              returnChat.conversation.members[j],
            );
            if (member.id) {
              members.push(member);
            }
          }
          returnChat.conversation.members = members;
        }
      }
      return returnChat;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createConversation(
    data: CreateConversationDto,
    user_id: number,
  ): Promise<any> {
    try {
      const queryBuilder = this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect(
          'conversation.last_message_sent',
          'last_message_sent',
        )
        .where(`:user_id = ANY(conversation.members)`, {
          user_id: user_id,
        });
      for (let i = 0; i < data.members.length; i++) {
        queryBuilder.andWhere(`:value = ANY(conversation.members)`, {
          value: data.members[i],
        });
      }
      queryBuilder.andWhere(
        `cardinality(conversation.members) <= ${data.members.length + 1}`,
      );

      if (data.gig_id) {
        queryBuilder.andWhere(`conversation.gig_id = :gig_id`, {
          gig_id: data.gig_id,
        });
      } else {
        queryBuilder.andWhere(`conversation.gig_id = :gig_id`, {
          gig_id: 0,
        });
      }
      const existingCon = await queryBuilder.getOne();
      console.log('existingCon.members.length', existingCon);

      if (existingCon && existingCon.members.length <= 2) {
        return existingCon;
      }
      const conversation = new Conversation();
      conversation.created_by = user_id;
      conversation.conversation_type = data.conversation_type;
      conversation.gig_id = data.gig_id;
      conversation.members = [...data.members, user_id];
      const member_name = [];
      for (let i = 0; i < conversation.members.length; i++) {
        const user = await firstValueFrom(
          this.userProxy.send<any>('get_user_by_id', {
            userId: Number(conversation.members[i]),
          }),
        );

        if (user && user.id) {
          const full_name = `${user.general_profile.first_name} ${user.general_profile.last_name}`;
          member_name.push(full_name);
        }
      }
      conversation.members_name = member_name.join(',');
      await this.conversationRepository.save(conversation);

      const members = [];
      if (conversation.members.length > 0) {
        for (let j = 0; j < conversation.members.length; j++) {
          const member = await this.getUserData(conversation.members[j]);
          if (member.id) {
            members.push(member);
          }
        }
      }
      conversation.members = members;

      return conversation;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createConversationMasterClass(
    data: any,
    user_id: number,
    message: string,
    title: string,
  ): Promise<Conversation> {
    try {
      const conversation = new Conversation();
      conversation.created_by = user_id;
      conversation.conversation_name = title;
      conversation.conversation_type = CONVERSATION_TYPE.MARKET_PLACE;
      conversation.members = [...data.members, user_id];
      const member_name = [];
      for (let i = 0; i < conversation.members.length; i++) {
        const user = await firstValueFrom(
          this.userProxy.send<any>('get_user_by_id', {
            userId: Number(conversation.members[i]),
          }),
        );
        const full_name = `${user.general_profile.first_name} ${user.general_profile.last_name}`;
        member_name.push(full_name);
      }
      conversation.members_name = member_name.join(',');
      await this.conversationRepository.save(conversation);
      const newChat = new Chat();
      newChat.conversation = conversation;
      newChat.message = message;
      newChat.seen_unseen = SEEN_UNSEEN.SEEN;
      newChat.sender = user_id;
      await this.chatRepository.save(newChat);
      await this.conversationRepository.update(
        { id: conversation.id },
        { last_message_sent: newChat },
      );
      return conversation;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getConversations(data: any, user_id: number): Promise<any> {
    try {
      const take = data.limit || 10;
      const page = data.page || 1;
      const skip = (page - 1) * take;

      const totalRecords = await this.conversationRepository.count({
        where: { created_by: user_id },
      });

      const totalPages = Math.ceil(totalRecords / take);

      const conversation = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect(
          'conversation.last_message_sent',
          'last_message_sent',
        )
        .where('conversation.created_by = :user_id', { user_id: user_id })
        .orWhere(':member = ANY (conversation.members)', { member: user_id })
        .orderBy('conversation.updated_at', 'DESC')
        .skip(skip)
        .take(take)
        .getMany();
      console.log('conversation', conversation);

      const response: any = [...conversation];

      if (response.length > 0) {
        for (let i = 0; i < response.length; i++) {
          response[i].created_by = await this.getUserData(
            response[i].created_by,
          );

          const members = [];
          if (response[i].members.length > 0) {
            for (let j = 0; j < response[i].members.length; j++) {
              const member = await this.getUserData(response[i].members[j]);
              if (member.id) {
                members.push(member);
              }
            }
          }
          response[i].members = members;

          if (response[i].last_message_sent) {
            response[i].last_message_sent.sender = await this.getUserData(
              response[i].last_message_sent.sender,
            );
          }
        }

        return {
          conversations: response,
          pagination: {
            totalRecords: totalRecords,
            totalPages: totalPages,
            currentPage: page,
            lastPage: totalPages,
          },
        };
      } else {
        return {
          status: 200,
          message: 'No conversation found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getConversationById(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: id,
      },
    });
    if (conversation) {
      for (let i = 0; i < conversation.members.length; i++) {
        const sender = await firstValueFrom(
          this.userProxy.send<any>('get_user_by_id', {
            userId: Number(conversation.members[i]),
          }),
        );
        conversation.members[i] = sender;
      }
    }
    return conversation;
  }

  async updateChatStatus(id: number[], seen_unseen: SEEN_UNSEEN): Promise<any> {
    await this.chatRepository.update(
      {
        id: In(id),
      },
      { seen_unseen: seen_unseen },
    );
    const chat = await this.chatRepository.find({
      where: {
        id: In(id),
      },
      relations: ['conversation'],
    });
    return chat;
  }

  public async getMessagesByConversationId(
    id: number,
    data: PaginationDto,
  ): Promise<any> {
    try {
      const take = data.limit || 10;
      const page = data.page || 1;
      const skip = (page - 1) * take;
      console.log('HOLDER ========= 1');

      const totalRecords = await this.chatRepository.count({
        where: {
          conversation: {
            id: id,
          },
        },
      });
      console.log('totalRecords', totalRecords);

      const totalPages = Math.ceil(totalRecords / take);
      const chat: any = await this.chatRepository.find({
        where: {
          conversation: {
            id: id,
          },
        },
        take: take,
        skip: skip,
        order: {
          created_at: 'DESC',
        },
      });
      console.log('chat', chat);

      for (let i = 0; i < chat.length; i++) {
        console.log('HOLDER === 2');
        if (chat[i].sender && chat[i].sender != 0) {
          console.log('HOLDER === 3');
          const sender = await firstValueFrom(
            this.userProxy.send<any>('get_user_by_id', {
              userId: chat[i].sender,
            }),
          );

          delete sender.password;
          delete sender.verification_code;
          delete sender.reset_password_otp;
          delete sender.general_profile.interest;

          chat[i].sender = sender;
          console.log('sender', sender);
        }
        if (chat[i].recipient && chat[i].recipient != 0) {
          console.log('HOLDER === 4');
          for (let j = 0; j < chat[i].recipient.length; j++) {
            console.log('HOLDER === 5');
            const recipient = await firstValueFrom(
              this.userProxy.send<any>('get_user_by_id', {
                userId: chat[i].recipient[j],
              }),
            );

            delete recipient.password;
            delete recipient.verification_code;
            delete recipient.reset_password_otp;
            delete recipient.general_profile.interest;

            chat[i].recipient[j] = recipient;
            console.log('recipient', recipient);
          }
        }
      }

      return {
        chat,
        pagination: {
          totalRecords: totalRecords,
          totalPages: totalPages,
          currentPage: page,
          lastPage: totalPages,
        },
      };
    } catch (error) {
      console.log('Err :>', error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getConversationMembers(id: number): Promise<any> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: id },
    });
    for (let i = 0; i < conversation.members.length; i++) {
      const sender = await this.getUserData(conversation.members[i]);
      conversation.members[i] = sender;
    }
    return conversation.members;
  }

  async getExistingConversation(
    to_user: number,
    from_user: number,
    gig_id?: number,
  ) {
    try {
      const queryBuilder = this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect(
          'conversation.last_message_sent',
          'last_message_sent',
        )
        .where(`:value = ANY(conversation.members)`, {
          value: from_user,
        })
        .andWhere(`:value = ANY(conversation.members)`, {
          value: to_user,
        })
        .andWhere(`cardinality(conversation.members) <= 2`);
      if (gig_id) {
        queryBuilder.andWhere(`conversation.gig_id = :gig_id`, { gig_id });
      } else {
        queryBuilder.andWhere(`conversation.gig_id = :gig_id`, { gig_id: 0 });
      }

      const existingConversation = await queryBuilder.getOne();
      if (existingConversation) {
        return existingConversation;
      } else {
        return {
          status: 200,
          message: 'No conversation found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addMemberToConversation(
    id: number,
    otherMembers: AddMemberToConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: id },
    });
    conversation.members = [...conversation.members, ...otherMembers.members];
    const member_name = [];
    if (conversation) {
      const members = [];
      for (let i = 0; i < conversation.members.length; i++) {
        const sender = await this.getUserData(conversation.members[i]);

        if (sender) {
          members.push(sender);
        }
        const full_name = `${
          sender && sender.general_profile
            ? sender.general_profile.first_name
            : ''
        } ${
          sender && sender.general_profile
            ? sender.general_profile.last_name
            : ''
        }`;
        member_name.push(full_name);
      }
      conversation.members_name = member_name.join(',');
      await this.conversationRepository.save(conversation);

      conversation.members = members;
    }

    return conversation;
  }

  async updateConversationName(
    id: number,
    data: ConversationNameDto,
  ): Promise<any> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: id },
      });
      if (!conversation) {
        return {
          status: 500,
          messages: 'Conversation Not Found',
        };
      }
      await this.conversationRepository.update(conversation.id, data);

      return {
        status: 200,
        message: 'Conversation name Updated Successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeMemberFromConversation(
    id: number,
    userId: number[],
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: id },
    });
    for (let i = 0; i < userId.length; i++) {
      conversation.members = conversation.members.filter(
        (member) => member !== userId[i],
      );
    }
    await this.conversationRepository.save(conversation);
    return conversation;
  }

  async getUserData(id: number): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userProxy.send<any>('get_user_by_id', {
          userId: id,
        }),
      );
      if (user.id) {
        delete user.password;
        delete user.verification_code;
        delete user.reset_password_otp;
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUrlContent(url: string): Promise<any> {
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateConversionAdmin(
    data: UpdateConversionAdminDto,
    user_id: number,
  ): Promise<any> {
    try {
      const conversion = await this.conversationRepository.findOne({
        where: {
          id: data.conversation_id,
        },
      });
      if (!conversion) {
        return {
          status: 500,
          message: 'No conversion found.',
        };
      }
      if (conversion.created_by != user_id) {
        return {
          status: 500,
          message: 'This conversation is not created by current user.',
        };
      }
      await this.conversationRepository.update(
        { id: conversion.id },
        { created_by: data.user_id },
      );
      return {
        status: 200,
        message: 'Conversation admin updated.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async searchChat(data: SearchChatDto, user_id: number): Promise<any> {
    try {
      const take = data.limit || 10;
      const page = data.page || 1;
      const skip = (page - 1) * take;
      const chat = await this.chatRepository
        .createQueryBuilder('chats')
        .where('sender = :user_id', { user_id: user_id })
        .andWhere('message LIKE LOWER(:message)', {
          message: `%${data.message}%`,
        });

      if (data.conversation_id) {
        chat.andWhere('conversation_id = :conversation_id', {
          conversation_id: data.conversation_id,
        });
      }
      const totalRecords = await chat.getCount();
      const totalPages = Math.ceil(totalRecords / take);
      chat.take(take);
      chat.skip(skip);
      const response: any = await chat.getMany();
      for (let i = 0; i < response.length; i++) {
        if (response[i].sender && response[i].sender != 0) {
          const sender = await firstValueFrom(
            this.userProxy.send<any>('get_user_by_id', {
              userId: Number(response[i].sender),
            }),
          );

          delete sender.password;
          delete sender.verification_code;
          delete sender.reset_password_otp;
          delete sender.general_profile.interest;

          response[i].sender = sender;
        }
        if (response[i].recipient && response[i].recipient != 0) {
          for (let j = 0; j < response[i].recipient.length; j++) {
            const recipient = await firstValueFrom(
              this.userProxy.send<any>('get_user_by_id', {
                userId: Number(response[i].recipient[j]),
              }),
            );

            delete recipient.password;
            delete recipient.verification_code;
            delete recipient.reset_password_otp;
            delete recipient.general_profile.interest;

            response[i].recipient[j] = recipient;
          }
        }
      }
      return {
        chat: response,
        pagination: {
          totalRecords: totalRecords,
          totalPages: totalPages,
          currentPage: page,
          lastPage: totalPages,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async searchConversation(
    data: any,
    pagination: any,
    user_id: number,
  ): Promise<any> {
    try {
      const take = pagination.limit || 10;
      const page = pagination.page || 1;
      const skip = (page - 1) * take;
      const chat = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect(
          'conversation.last_message_sent',
          'last_message_sent',
        )
        .where(':user_id = ANY(members)', { user_id: user_id })
        .andWhere('members_name LIKE LOWER(:message)', {
          message: `%${data.search}%`,
        })
        .orderBy('conversation.updated_at', 'DESC')
        .take(take)
        .skip(skip);
      const responseData = await chat.getManyAndCount();
      const response = responseData[0];
      const totalRecords = responseData[1];

      const totalPages = Math.ceil(totalRecords / take);
      if (response.length > 0) {
        for (let i = 0; i < response.length; i++) {
          response[i].created_by = await this.getUserData(
            response[i].created_by,
          );

          const members = [];
          if (response[i].members.length > 0) {
            for (let j = 0; j < response[i].members.length; j++) {
              const member = await this.getUserData(response[i].members[j]);
              if (member.id) {
                members.push(member);
              }
            }
          }
          response[i].members = members;

          if (response[i].last_message_sent) {
            response[i].last_message_sent.sender = await this.getUserData(
              response[i].last_message_sent.sender,
            );
          }
        }

        return {
          conversations: response,
          pagination: {
            totalRecords: totalRecords,
            totalPages: totalPages,
            currentPage: page,
            lastPage: totalPages,
          },
        };
      } else {
        return {
          status: 200,
          message: 'No conversation found',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async removeConversationById(id: number): Promise<any> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: id },
    });
    if (!conversation) {
      return {
        status: 500,
        message: 'No conversation found.',
      };
    }
    await this.conversationRepository.delete(id);
    return {
      status: 200,
      message: 'Conversation deleted successfully.',
    };
  }
}
