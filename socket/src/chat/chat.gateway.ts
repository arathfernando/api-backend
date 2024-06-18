import { Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { firstValueFrom } from 'rxjs';
import { Socket, Server } from 'socket.io';
import { ConversationService } from 'src/conversation/conversation.service';
import { SEEN_UNSEEN, TRUE_FALSE } from 'src/core/constant/enum.constant';
import { Chat } from 'src/database/entities';
import { NotificationService } from 'src/notification/notification.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenProxy: ClientProxy,
    @Inject('USER_SERVICE') private readonly userProxy: ClientProxy,
    private readonly notificationService: NotificationService,
    private readonly conversationService: ConversationService,
  ) {
    this.tokenProxy.connect();
    this.userProxy.connect();
  }
  @WebSocketServer()
  server: Server;

  clients: any = [];
  async sendNotification(notification: any) {
    console.log('EVENT CALLED FOER SEND NOTIFICATION');
    const userClient = this.getConnectedClientByUserId(
      notification.notification_to,
    );
    if (userClient && typeof userClient.emit != 'undefined') {
      userClient.emit('notification', notification);
      await this.notificationService.markAsSent(notification.id);
    }
    return true;
  }
  async handleConnection(client: any) {
    console.log('START');
    const authorization: any = client.handshake.query.authorization;
    console.log('HOLDER 1');
    console.log('authorization', authorization);

    if (!authorization) {
      console.log('HOLDER 2');
      client.disconnect(true);
      return;
    }

    const token = authorization.replace('Bearer ', '');
    const decode = await firstValueFrom(
      this.tokenProxy.send('token_decode', token),
    );
    console.log('decode', decode);

    if (!decode) {
      client.disconnect(true);
      return;
    }
    console.log('HOLDER 3');

    // const interval = setInterval(async () => {
    //   if (!client.isAlive) {
    //     // Client is inactive, close the connection
    //     await firstValueFrom(
    //       this.userProxy.send('change_user_chat_status', {
    //         userId: client.userId,
    //         status: 'OFFLINE',
    //       }),
    //     );
    //     clearInterval(interval);
    //     client.close();
    //   }
    //   // Send a ping message to keep the connection alive
    //   client.ping();
    // }, 60000);

    // client.isAlive = true;
    // client.on('pong', () => (client.isAlive = true));

    client.userId = decode.userId;
    client.conversationId = 0;
    this.clients.push(client);
    console.log('HOLDER 4');

    // Pending notifications
    const pendingNotifications =
      await this.notificationService.getPendingNotifications(decode.userId);
    console.log('pendingNotifications', pendingNotifications);
    if (pendingNotifications && pendingNotifications.length > 0) {
      console.log('HOLDER for pendingNotifications');
      for (let i = 0; i < pendingNotifications.length; i++) {
        if (pendingNotifications[i].notification_to) {
          pendingNotifications[i].notification_to = await firstValueFrom(
            this.userProxy.send<any>('get_user_by_id', {
              userId: Number(pendingNotifications[i].notification_to),
            }),
          );
        }
        if (pendingNotifications[i].notification_from) {
          pendingNotifications[i].notification_from = await firstValueFrom(
            this.userProxy.send<any>('get_user_by_id', {
              userId: Number(pendingNotifications[i].notification_from),
            }),
          );
        }

        // if (notification_to.fcm_token) {
        //   console.log('HOLDER 5');
        //   const payload = {
        //     notification: {
        //       title: pendingNotifications[i].title,
        //       body: pendingNotifications[i].content,
        //       payload: pendingNotifications[i].payload,
        //     },
        //   };
        //   try {
        //     console.log('HOLDER 6');
        //     const dataDD = await messaging.sendToDevice(
        //       notification_to.fcm_token,
        //       payload,
        //     );
        //     console.log('dataDD ===>', dataDD);
        //   } catch (error) {
        //     console.log(error);
        //     throw new InternalServerErrorException(error);
        //   }
        // }
        if (client && typeof client.emit != 'undefined') {
          client.emit('notification', pendingNotifications[i]);
          await this.notificationService.markAsSent(pendingNotifications[i].id);
        }
      }
    }
    return true;
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number },
  ): Promise<void> {
    const conversationId = data.conversationId;

    // check if conversation exists
    const conversation = await this.conversationService.getConversationById(
      conversationId,
    );
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // join the room
    client.join(conversationId.toString());
    // notify other clients in the room
    client
      .to(conversationId.toString())
      .emit('user_joined', { userId: client.id });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; message: string },
  ): Promise<Chat | any> {
    console.log('DATA====>>>>>>>>>', data);
    const senderId = this.getConnectedClient(client.id);
    const { conversationId, message } = data;

    if (!senderId) {
      client.disconnect(true);
      return {
        message: 'User not found',
      };
    }

    if (!conversationId || !message) {
      client.disconnect(true);
      return {
        message: 'Conversation Id or Message not found',
      };
    }
    const userId = senderId.userId;

    const conversation: any =
      await this.conversationService.getConversationById(conversationId);

    if (conversation) {
      let isUserInConversation = false;
      for (let i = 0; i < conversation.members.length; i++) {
        if (conversation.members[i] && conversation.members[i].id === userId) {
          isUserInConversation = true;
          break;
        }
      }
      if (!isUserInConversation) {
        console.log('You are not part of the conversation');
        return {
          status: 500,
          message: 'You are not part of the conversation',
        };
      }
      const messageAdded = await this.conversationService.createMessage(
        conversationId,
        userId,
        message,
      );
      console.log('messageAdded====>>>>>', messageAdded);
      // notify other clients in the room
      // client.to(conversationId.toString()).emit('receive_message', messageAdded);
      if (
        !messageAdded.status &&
        messageAdded &&
        messageAdded.conversation.members.length > 0
      ) {
        console.log('INNER IF');
        const conversationMembers = messageAdded.conversation.members;
        // console.log('conversationMembers===>>', conversationMembers);

        for (let i = 0; i < conversationMembers.length; i++) {
          // if (conversationMembers[i].id == userId) continue;

          const userClient = this.getConnectedClientByUserId(
            conversationMembers[i].id,
          );
          if (userClient) {
            if (userClient.conversation_id != conversationId) {
              const notification = {
                notification_from: userId,
                notification_to: conversationMembers[i].id,
                content: `You have a new message from ${messageAdded.sender.general_profile.first_name} ${messageAdded.sender.general_profile.last_name}`,
                payload: JSON.stringify(messageAdded.conversation),
                type: 'chat-message',
                seen_unseen: SEEN_UNSEEN.SEEN,
                sent: TRUE_FALSE.TRUE,
              };

              await this.notificationService.createNotification(notification);
              if (userClient && typeof userClient.emit != 'undefined') {
                userClient.emit('message_notification', messageAdded);
              }
            }
            if (userClient && typeof userClient.emit != 'undefined') {
              userClient.emit('receive_message', messageAdded);
            }
          } else {
            const notification = {
              notification_from: userId,
              notification_to: conversationMembers[i].id,
              content: `You have a new message from ${messageAdded.sender.general_profile.first_name} ${messageAdded.sender.general_profile.last_name}`,
              payload: JSON.stringify(messageAdded.conversation),
              type: 'chat-message',
              seen_unseen: SEEN_UNSEEN.UNSEEN,
              sent: TRUE_FALSE.FALSE,
            };

            await this.notificationService.createNotification(notification);
          }
        }
        return messageAdded;
      }
    } else {
      console.log('conversation not found');
      return {
        status: 500,
        message: 'conversation not found',
      };
    }
  }

  @SubscribeMessage('send_notification')
  async handleSendNotification(
    @ConnectedSocket() client: Socket,
  ): Promise<Chat | any> {
    console.log('START');
    const senderId = this.getConnectedClient(client.id).userId;

    if (!senderId) {
      return {
        message: 'User not connected',
      };
    }
    const notifications =
      await this.notificationService.getPendingSentNotifications(senderId);
    console.log('notifications', notifications);

    if (notifications && notifications.length > 0) {
      for (let i = 0; i < notifications.length; i++) {
        const userClient = this.getConnectedClientByUserId(
          notifications[i].notification_to,
        );
        if (userClient && typeof userClient.emit != 'undefined') {
          userClient.emit('notification', notifications[i]);
          await this.notificationService.markAsSent(notifications[i].id);
        }
        // if (notification_to.fcm_token) {
        //   const payload = {
        //     notification: {
        //       title: notifications[i].title,
        //       body: notifications[i].content,
        //       payload: notifications[i].payload,
        //     },
        //   };
        //   try {
        //     const notificationData = await messaging.sendToDevice(
        //       notification_to.fcm_token,
        //       payload,
        //     );
        //     console.log('notificationData ===>', notificationData);
        //   } catch (error) {
        //     console.log('error ====>', error);
        //     throw new InternalServerErrorException(error);
        //   }
        //   await this.notificationService.markAsSent(notifications[i].id);
        // }
      }
    }
  }

  @SubscribeMessage('status')
  async handleOnline(
    @MessageBody() data: { userId: number; status: string },
  ): Promise<Chat | any> {
    const { userId, status } = data;

    if (!userId || !status) {
      return {
        message: 'User Id or Status not found',
      };
    }
    // change user state
    const statusChanged = await firstValueFrom(
      this.userProxy.send('change_user_chat_status', {
        userId,
        status,
      }),
    );

    return statusChanged;
  }

  async handleDisconnect(client: any) {
    console.log(`Client ${client.id} disconnected`);
    if (client.conversation_id && client.conversation_id != 0) {
      const conversation: any =
        await this.conversationService.getConversationById(
          client.conversation_id,
        );
      console.log('conversation for status', conversation);

      for (let i = 0; i < conversation.members.length; i++) {
        console.log('conversation.members', conversation.members[i]);

        if (conversation.members[i].id) {
          console.log('conversation.members[i].id', conversation.members[i].id);

          const userClient = this.getConnectedClientByUserId(
            conversation.members[i].id,
          );
          console.log('userClient', userClient);
          if (userClient && typeof userClient.emit != 'undefined') {
            userClient.emit('typing_status', {
              userId: client.userId,
              conversationId: conversation,
              is_typing: 'FALSE',
            });
          }
        }
      }
    }
    await firstValueFrom(
      this.userProxy.send('change_user_chat_status', {
        userId: client.userId,
        status: 'OFFLINE',
      }),
    );

    this.clients.splice(this.clients.indexOf(client), 1);
    clearInterval(client.interval);
  }

  getConnectedClient(id: string) {
    return this.clients.find((client) => client.id === id);
  }

  getConnectedClientByUserId(user_id: number) {
    return this.clients.find((client) => client.userId === user_id);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody()
    data: {
      userId: number;
      conversationId: number;
      is_typing: string;
    },
  ): Promise<Chat | any> {
    console.log('data', data);
    const { userId, conversationId, is_typing } = data;
    console.log('data === ', data);
    console.log('START typing');
    const conversation: any =
      await this.conversationService.getConversationById(conversationId);
    console.log('conversation', conversation);
    if (conversation) {
      console.log('if conversation');
      for (let i = 0; i < conversation.members.length; i++) {
        console.log('conversation.members', conversation.members[i]);
        if (conversation.members[i].id) {
          console.log('conversation.members[i].id', conversation.members[i].id);
          const userClient = this.getConnectedClientByUserId(
            conversation.members[i].id,
          );
          console.log('userClient', userClient);
          if (userClient && typeof userClient.emit != 'undefined') {
            userClient.emit('typing_status', {
              userId,
              conversationId: conversation,
              is_typing,
            });
          }
        }
      }
    }
    return true;
  }
  @SubscribeMessage('update_chat_status')
  async handleChatStatus(
    @MessageBody()
    data: {
      chatId: number[];
      seen_unseen: SEEN_UNSEEN;
    },
  ): Promise<Chat | any> {
    const { chatId, seen_unseen } = data;

    const chat = await this.conversationService.updateChatStatus(
      chatId,
      seen_unseen,
    );
    if (chat.length) {
      for (let j = 0; j < chat.length; j++) {
        for (let i = 0; i < chat[j].conversation.members.length; i++) {
          const userClient = this.getConnectedClientByUserId(
            chat[j].conversation.members[i],
          );
          if (userClient && typeof userClient.emit != 'undefined') {
            userClient.emit('update_receive_chat_status', {
              chat: chat,
            });
          }
        }
      }
    }
    return true;
  }

  @SubscribeMessage('update_notification_status')
  async handleNotificationStatus(
    @MessageBody()
    data: {
      notificationId: number[];
      seen_unseen: SEEN_UNSEEN;
    },
  ): Promise<Chat | any> {
    const { notificationId, seen_unseen } = data;

    await this.notificationService.updateNotificationStatus(
      notificationId,
      seen_unseen,
    );
    return true;
  }

  @SubscribeMessage('update_admin_notification_status')
  async handleAdminNotificationStatus(
    @MessageBody()
    data: {
      notificationId: number[];
      seen_unseen: SEEN_UNSEEN;
    },
  ): Promise<Chat | any> {
    const { notificationId, seen_unseen } = data;

    await this.notificationService.updateNotificationStatus(
      notificationId,
      seen_unseen,
    );
    return true;
  }

  @SubscribeMessage('current_user_conversation')
  async handleUserConversation(
    @MessageBody()
    data: {
      user_id: number;
      conversation_id: number;
    },
  ): Promise<Chat | any> {
    if (!data.user_id || !data.conversation_id) {
      return {
        status: 500,
        message: 'user_id and conversation_id is required',
      };
    }
    const { user_id, conversation_id } = data;
    const client = this.getConnectedClientByUserId(user_id);
    const index = this.clients.indexOf(client);
    this.clients[index].conversation_id = conversation_id;
    return true;
  }
}
