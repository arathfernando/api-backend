import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import {
  NOTIFICATION_TYPE,
  SEEN_UNSEEN,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import { GetNotificationByStatusDto, PaginationDto } from 'src/core/dtos';
import { Notification } from 'src/database/entities';
import { Between, In, Not, Repository } from 'typeorm';
// import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('USER_SERVICE') private readonly userProxy: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminProxy: ClientProxy,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>, // private readonly chatGateway: ChatGateway,
  ) {
    this.userProxy.connect();
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  public async createNotification(data: any): Promise<any> {
    try {
      const notification = new Notification();
      notification.notification_from = data.notification_from;
      notification.notification_to = data.notification_to;
      notification.content = data.content;
      notification.title = data.title;
      notification.payload = JSON.stringify(data.payload);
      notification.type = data.type;
      notification.notification_type = NOTIFICATION_TYPE.PERSONAL;
      notification.seen_unseen = data.seen_unseen
        ? data.seen_unseen
        : SEEN_UNSEEN.UNSEEN;
      notification.sent = data.sent ? data.sent : TRUE_FALSE.FALSE;
      notification.course_id = data.course_id ? data.course_id : null;

      const notificationData = await this.notificationRepository.save(
        notification,
      );
      if (data.notification_to && data.notification_to > 0) {
        await firstValueFrom(
          this.userProxy.send(
            'update_user_notification_status',
            JSON.stringify(data.notification_to),
          ),
        );
      }
      if (data.notification_to && data.notification_to == 0) {
        await firstValueFrom(
          this.adminProxy.send(
            'update_admin_notification_status',
            JSON.stringify(data.notification_to),
          ),
        );
      }
      const notification_to = await firstValueFrom(
        this.userProxy.send<any>('get_user_by_id', {
          userId: Number(data.notification_to),
        }),
      );
      console.log('notification_to', notification_to);
      // await this.chatGateway.sendNotification(notificationData);
      if (notification_to.fcm_token) {
        const messaging = await admin.messaging();
        const payload = {
          notification: {
            title: data.title,
            body: data.content,
            payload: JSON.stringify(data.payload),
          },
        };
        try {
          const notificationData = await messaging.sendToDevice(
            notification_to.fcm_token,
            payload,
          );
          console.log('notificationData', notificationData);
        } catch (error) {
          return {
            message: 'Notification added successfully',
          };
        }
        await this.markAsSent(notification.id);
      }
      return {
        message: 'Notification added successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createGlobalNotification(data: any): Promise<any> {
    try {
      const users = await this.notificationRepository.query(
        'SELECT id FROM users',
      );
      const saveArr = [];
      for (let i = 0; i < users.length; i++) {
        const notification = new Notification();
        notification.notification_from = data.notification_from;
        notification.notification_to = users[i].id;
        notification.content = data.content;
        notification.payload = data.payload
          ? data.payload
          : JSON.stringify(data);
        notification.type = data.type;
        notification.seen_unseen = data.seen_unseen
          ? data.seen_unseen
          : SEEN_UNSEEN.UNSEEN;
        notification.sent = data.sent ? data.sent : TRUE_FALSE.FALSE;
        notification.notification_type = NOTIFICATION_TYPE.GLOBAL;
        saveArr.push(notification);
      }
      await this.notificationRepository.save(saveArr);
      return {
        message: 'Notification added successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateNotification(id: number, data: any): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!notification) {
        return {
          message: 'Notification Not found',
        };
      }
      await this.notificationRepository.update(id, data);
      return {
        message: 'Notification updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getNotificationById(notificationId: number): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: {
          id: notificationId,
        },
      });
      if (!notification) {
        return {
          message: 'Notification Not found',
        };
      }
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllUserNotification(
    user_id: number,
    data: PaginationDto,
  ): Promise<any> {
    const take = data.limit || 10;
    const page = data.page || 1;
    const skip = (page - 1) * take;
    try {
      const where =
        user_id == 0
          ? { notification_to: user_id, type: Not('chat-message') }
          : { notification_to: user_id, type: Not('chat-message') };
      const notification = await this.notificationRepository.find({
        where: where,
        order: {
          id: 'DESC',
        },
        take: take,
        skip: skip,
      });

      if (!notification || notification.length <= 0) {
        return {
          message: 'No notification found',
        };
      }

      const notificationResp: any = [...notification];
      if (notificationResp.length > 0) {
        for (let i = 0; i < notificationResp.length; i++) {
          if (notificationResp[i].notification_from > 0) {
            const notificationSender = await this.getUserData(
              notificationResp[i].notification_from,
            );

            if (notificationSender) {
              notificationResp[i].notification_from = notificationSender;
            }
          }

          if (notificationResp[i].notification_to > 0) {
            const notificationTo = await this.getUserData(
              notificationResp[i].notification_to,
            );

            if (notificationTo) {
              notificationResp[i].notification_to = notificationTo;
            }
          }
        }
      }

      const count = await this.notificationRepository.count({
        where: {
          notification_to: user_id,
          type: Not('chat-message'),
        },
      });

      const currentPage = page;
      const nextPage = notification.length === take ? page + 1 : undefined;
      const prevPage = page > 1 ? page - 1 : undefined;

      const lastPage = Math.ceil(count / take);

      return {
        data: notificationResp,
        count,
        currentPage,
        nextPage,
        prevPage,
        lastPage,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllNotification(data: PaginationDto): Promise<any> {
    const take = data.limit || 10;
    const page = data.page || 1;
    const skip = (page - 1) * take;
    try {
      const notification = await this.notificationRepository.find({
        order: {
          id: 'DESC',
        },
        take: take,
        skip: skip,
      });

      if (!notification || notification.length <= 0) {
        return {
          message: 'No notification found',
        };
      }

      const notificationResp: any = [...notification];
      if (notificationResp.length > 0) {
        for (let i = 0; i < notificationResp.length; i++) {
          if (notificationResp[i].notification_from > 0) {
            const notificationSender = await this.getUserData(
              notificationResp[i].notification_from,
            );

            if (notificationSender) {
              notificationResp[i].notification_from = notificationSender;
            }
          }

          if (notificationResp[i].notification_to > 0) {
            const notificationTo = await this.getUserData(
              notificationResp[i].notification_to,
            );

            if (notificationTo) {
              notificationResp[i].notification_to = notificationTo;
            }
          }
        }
      }

      const count = await this.notificationRepository.count({
        take: take,
        skip: skip,
      });

      const currentPage = page;
      const nextPage = notification.length === take ? page + 1 : undefined;
      const prevPage = page > 1 ? page - 1 : undefined;

      const lastPage = Math.ceil(count / take);

      return {
        data: notificationResp,
        count: notificationResp.length,
        currentPage,
        nextPage,
        prevPage,
        lastPage,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getAllMessageNotification(
    user_id: number,
    data: PaginationDto,
  ): Promise<any> {
    const take = data.limit || 10;
    const page = data.page || 1;
    const skip = (page - 1) * take;

    try {
      const notification = await this.notificationRepository.find({
        where: {
          notification_to: user_id,
          type: 'chat-message',
        },
        order: {
          id: 'DESC',
        },
        take: take,
        skip: skip,
      });

      if (!notification || notification.length <= 0) {
        return {
          message: 'No notification found',
        };
      }

      const notificationResp: any = [...notification];
      if (notificationResp.length > 0) {
        for (let i = 0; i < notificationResp.length; i++) {
          const payloadString = JSON.parse(notificationResp[i].payload);
          notificationResp[i].payload = payloadString;
          if (notificationResp[i].notification_from > 0) {
            const notificationSender = await this.getUserData(
              notificationResp[i].notification_from,
            );

            if (notificationSender) {
              notificationResp[i].notification_from = notificationSender;
            }
          }

          if (notificationResp[i].notification_to > 0) {
            const notificationTo = await this.getUserData(
              notificationResp[i].notification_to,
            );

            if (notificationTo) {
              notificationResp[i].notification_to = notificationTo;
            }
          }
        }
      }

      const unSeenCount = await this.notificationRepository.count({
        where: {
          notification_to: user_id,
          type: 'chat-message',
          seen_unseen: SEEN_UNSEEN.UNSEEN,
        },
      });

      const count = await this.notificationRepository.count({
        where: {
          notification_to: user_id,
          type: 'chat-message',
        },
      });

      const currentPage = page;
      const nextPage = notification.length === take ? page + 1 : undefined;
      const prevPage = page > 1 ? page - 1 : undefined;
      const lastPage = Math.ceil(count / take);

      return {
        data: notificationResp,
        unseen_messages: unSeenCount,
        count,
        currentPage,
        nextPage,
        prevPage,
        lastPage,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async markAsSeen(id: number): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOne({
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
      await this.notificationRepository.update(id, {
        seen_unseen: SEEN_UNSEEN.SEEN,
      });
      return {
        status: 200,
        message: 'Notification updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async markAsSent(id: number): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOne({
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
      await this.notificationRepository.update(id, {
        sent: TRUE_FALSE.TRUE,
      });
      return {
        status: 200,
        message: 'Notification updated successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPendingNotifications(user_id: number): Promise<any> {
    try {
      const pendingNotifications = await this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.notification_to = :user_id', { user_id })
        .andWhere('notification.sent = :sent', {
          sent: TRUE_FALSE.FALSE,
        })
        .andWhere('notification.notification_type = :type', {
          type: NOTIFICATION_TYPE.PERSONAL,
        })
        .getMany();

      return pendingNotifications || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPendingSentNotifications(user_id: number): Promise<any> {
    try {
      const pendingNotifications = await this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.notification_from = :user_id', { user_id })
        .andWhere('notification.seen_unseen = :seen_unseen', {
          seen_unseen: SEEN_UNSEEN.UNSEEN,
        })
        .andWhere('notification.sent = :sent', {
          sent: TRUE_FALSE.FALSE,
        })
        .andWhere('notification.notification_type = :type', {
          type: NOTIFICATION_TYPE.PERSONAL,
        })
        .getMany();

      return pendingNotifications || [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserNotificationByStatus(
    data: GetNotificationByStatusDto,
  ): Promise<any> {
    try {
      const notification = await this.notificationRepository.find({
        where: {
          notification_to: data.user_id,
          seen_unseen: data.status,
        },
        order: {
          id: 'DESC',
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

  async deleteNotification(id: number): Promise<any> {
    try {
      await this.notificationRepository.delete({
        id: id,
      });
      return {
        status: 200,
        message: 'notification removed successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateNotificationStatus(
    id: number[],
    seen_unseen: SEEN_UNSEEN,
  ): Promise<any> {
    await this.notificationRepository.update(
      {
        id: In(id),
      },
      { seen_unseen: seen_unseen },
    );
    return true;
  }

  async deleteAllMessageNotification(user_id: number): Promise<any> {
    try {
      await this.notificationRepository.delete({
        notification_to: user_id,
        type: 'chat-message',
      });
      return {
        status: 200,
        message: 'All notification removed successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAllMessageNotification(user_id: number): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: {
          notification_to: user_id,
          type: 'chat-message',
        },
      });
      if (!notification) {
        return {
          message: 'Notification Not found',
        };
      }
      await this.notificationRepository.update(
        { notification_to: user_id },
        { seen_unseen: SEEN_UNSEEN.SEEN },
      );
      return {
        status: 200,
        message: 'Mark all Notification as read',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async deleteAllNotification(user_id: number): Promise<any> {
    try {
      await this.notificationRepository.delete({ notification_to: user_id });
      return {
        status: 200,
        message: 'All notification removed successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAllNotification(user_id: number): Promise<any> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: {
          notification_to: user_id,
        },
      });
      if (!notification) {
        return {
          message: 'Notification Not found',
        };
      }
      await this.notificationRepository.update(
        { notification_to: user_id },
        { seen_unseen: SEEN_UNSEEN.SEEN },
      );
      return {
        status: 200,
        message: 'Mark all Notification as read',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getCourseNotification(data: any, user_id: number): Promise<any> {
    const take = data.data.limit || 10;
    const page = data.data.page || 1;
    const skip = (page - 1) * take;
    try {
      let condition: any = {};
      if (data.data.course_id > 0) {
        condition = {
          where: {
            course_id: data.data.course_id,
            notification_to: user_id,
          },

          take: take,
          skip: skip,
        };
      } else {
        condition = {
          where: { notification_to: user_id, course_id: Not('null') },

          take: take,
          skip: skip,
        };
      }

      if (data.data.date_filter == 'TODAY') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        condition.where.created_at = Between(today, tomorrow);
      }
      if (data.data.date_filter == 'LAST_MONTH') {
        const today = new Date();
        const startOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );

        condition.where.created_at = Between(startOfLastMonth, today);
      }
      if (data.data.date_filter == 'LAST_WEEK') {
        const today = new Date();
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 6);

        condition.where.created_at = Between(startOfLastWeek, today);
      }
      if (data.data.date_filter == 'LAST_YEAR') {
        const today = new Date();
        const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);

        condition.where.created_at = Between(startOfLastYear, today);
      }

      const notification = await this.notificationRepository.find({
        ...condition,
        order: {
          created_at: 'DESC',
        },
      });

      const notificationResp: any = [...notification];
      if (notificationResp.length > 0) {
        for (let i = 0; i < notificationResp.length; i++) {
          if (notificationResp[i].notification_from > 0) {
            const notificationSender = await this.getUserData(
              notificationResp[i].notification_from,
            );

            if (notificationSender) {
              notificationResp[i].notification_from = notificationSender;
            }
          }

          if (notificationResp[i].notification_to > 0) {
            const notificationTo = await this.getUserData(
              notificationResp[i].notification_to,
            );

            if (notificationTo) {
              notificationResp[i].notification_to = notificationTo;
            }
          }
        }
      }

      const total = await this.notificationRepository.count({
        ...condition,
      });

      const totalPages = Math.ceil(total / data.data.limit);

      return {
        data: notificationResp,
        page: data.data.page,
        limit: data.data.limit,
        total_pages: totalPages,
        count: notificationResp.length,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
