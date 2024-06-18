import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import {
  ANALYTICS_TRANSACTION_TYPE as ANALYTICS_TRANSACTION_TYPE,
  ASSIGN_SHARE_FILTER,
  TRANSACTION_FOR_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from 'src/core/constant/enum.constant';
import {
  CreateTransactionDto,
  PaginationDto,
  UpdateTransactionDto,
} from 'src/core/dtos';
import { GetAnalyticsByTransactionTypeDto } from 'src/core/dtos/get-analytics-by-transaction-type.dto';
import { GetByTransactionTypeDto } from 'src/core/dtos/get-by-transaction-type.dto';
import { Transaction } from 'src/database/entities';
import { In, Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
    this.userClient.connect();
  }

  async findAll(
    pagination: PaginationDto,
    user_id: number,
  ): Promise<Transaction[]> {
    try {
      const take = pagination.limit;
      const skip = (pagination.page - 1) * pagination.limit;
      const transaction = await this.transactionRepository.find({
        where: {
          created_by: user_id,
        },
        take: take,
        skip: skip,
      });
      for (let i = 0; i < transaction.length; i++) {
        if (transaction[i].transaction_for_type == TRANSACTION_FOR_TYPE.USER) {
          const transaction_to = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(transaction[i].transaction_to),
            }),
          );
          transaction[i].transaction_to = transaction_to;
        } else if (
          transaction[i].transaction_for_type == TRANSACTION_FOR_TYPE.COMMUNITY
        ) {
          const transaction_to = await firstValueFrom(
            this.communityClient.send<any>(
              'get_community_by_id',
              Number(transaction[i].transaction_to),
            ),
          );
          transaction[i].transaction_to = transaction_to;
        }
        const created_by = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(transaction[i].created_by),
          }),
        );
        transaction[i].created_by = created_by;

        if (transaction[i] && transaction[i].area) {
          const area = await firstValueFrom(
            this.adminClient.send<any>('get_zone', transaction[i].area),
          );
          transaction[i].area = area;
          delete area.created_by;
          delete area.general_profile;
        }
      }
      return transaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: number): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: {
          id: id,
        },
      });
      if (transaction.transaction_for_type == TRANSACTION_FOR_TYPE.USER) {
        const transaction_to = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(transaction.transaction_to),
          }),
        );
        transaction.transaction_to = transaction_to;
      } else if (
        transaction.transaction_for_type == TRANSACTION_FOR_TYPE.COMMUNITY
      ) {
        const transaction_to = await firstValueFrom(
          this.communityClient.send<any>(
            'get_community_by_id',
            Number(transaction.transaction_to),
          ),
        );
        transaction.transaction_to = transaction_to;
      }
      const created_by = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(transaction.created_by),
        }),
      );
      transaction.created_by = created_by;
      return transaction;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  async findByTransactionType(data: GetByTransactionTypeDto): Promise<any> {
    try {
      const take = data.limit;
      const skip = (data.page - 1) * data.limit;

      let where = {};
      if (data.search && !data.filter) {
        const userData = await this.transactionRepository.query(
          `SELECT * from general_profile WHERE first_name LIKE LOWER('%${data.search}%') OR last_name LIKE LOWER('%${data.search}%')`,
        );
        const zone = await this.transactionRepository.query(
          `SELECT * from zones WHERE area_name LIKE LOWER('%${data.search}%') OR subarea_name LIKE LOWER('%${data.search}%')`,
        );
        const zoneIds = await this.arrayColumn(zone, 'id');
        const userIds = await this.arrayColumn(userData, 'user_id');
        where = {
          where: [
            {
              created_by: In(userIds),
            },
            {
              area: In(zoneIds),
            },
          ],
        };
      } else if (data.search && data.filter) {
        if (data.filter == ASSIGN_SHARE_FILTER.USER) {
          const userData = await this.transactionRepository.query(
            `SELECT * from general_profile WHERE first_name LIKE LOWER('%${data.search}%') OR last_name LIKE LOWER('%${data.search}%')`,
          );
          const userIds = await this.arrayColumn(userData, 'user_id');
          where = {
            where: [
              {
                created_by: In(userIds),
              },
            ],
          };
        }
        if (data.filter == ASSIGN_SHARE_FILTER.AREA) {
          const zone = await this.transactionRepository.query(
            `SELECT * from zones WHERE area_name LIKE LOWER('%${data.search}%')`,
          );
          const zoneIds = await this.arrayColumn(zone, 'id');
          where = {
            where: [
              {
                area: In(zoneIds),
              },
            ],
          };
        }
        if (data.filter == ASSIGN_SHARE_FILTER.SUBAREA) {
          const zone = await this.transactionRepository.query(
            `SELECT * from zones WHERE subarea_name LIKE LOWER('%${data.search}%')`,
          );
          const zoneIds = await this.arrayColumn(zone, 'id');
          where = {
            where: [
              {
                area: In(zoneIds),
              },
            ],
          };
        }
      }
      if (data.funds) {
        await this.transactionRepository.find(
          (where = {
            where: [
              {
                transaction_status: data.funds,
              },
            ],
          }),
        );
      }
      if (data.transaction_type) {
        await this.transactionRepository.find(
          (where = {
            where: [
              {
                transaction_to_type: data.transaction_type,
              },
            ],
          }),
        );
      }

      const transaction = await this.transactionRepository.find({
        take: take,
        skip: skip,
        ...where,
      });

      const total = await this.transactionRepository.count({
        ...where,
      });
      const totalPages = Math.ceil(total / data.limit);
      for (let i = 0; i < transaction.length; i++) {
        if (transaction[i].transaction_for_type == TRANSACTION_FOR_TYPE.USER) {
          const transaction_to = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(transaction[i].transaction_to),
            }),
          );
          transaction[i].transaction_to = transaction_to;
        } else if (
          transaction[i].transaction_for_type == TRANSACTION_FOR_TYPE.COMMUNITY
        ) {
          const transaction_to = await firstValueFrom(
            this.communityClient.send<any>(
              'get_community_by_id',
              Number(transaction[i].transaction_to),
            ),
          );
          transaction[i].transaction_to = transaction_to;
        }
        const created_by = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(transaction[i].created_by),
          }),
        );
        transaction[i].created_by = created_by;
        if (transaction[i] && transaction[i].area) {
          const area = await firstValueFrom(
            this.adminClient.send<any>('get_zone', transaction[i].area),
          );
          transaction[i].area = area;
          delete area.created_by;
          delete area.general_profile;
        }
      }
      return {
        data: transaction,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserTransaction(
    data: GetByTransactionTypeDto,
    user_id: number,
  ): Promise<any> {
    try {
      const take = data.limit;
      const skip = (data.page - 1) * data.limit;
      const where: any = {};
      if (data.search && !data.filter) {
        const zone = await this.transactionRepository.query(
          `SELECT * from zones WHERE area_name LIKE LOWER('%${data.search}%') OR subarea_name LIKE LOWER('%${data.search}%')`,
        );
        const zoneIds = await this.arrayColumn(zone, 'id');
        where.area = In(zoneIds);
      } else if (data.search && data.filter) {
        if (data.filter == ASSIGN_SHARE_FILTER.USER) {
        }
        if (data.filter == ASSIGN_SHARE_FILTER.AREA) {
          const zone = await this.transactionRepository.query(
            `SELECT * from zones WHERE area_name LIKE LOWER('%${data.search}%')`,
          );
          const zoneIds = await this.arrayColumn(zone, 'id');
          where.area = In(zoneIds);
        }
        if (data.filter == ASSIGN_SHARE_FILTER.SUBAREA) {
          const zone = await this.transactionRepository.query(
            `SELECT * from zones WHERE subarea_name LIKE LOWER('%${data.search}%')`,
          );
          const zoneIds = await this.arrayColumn(zone, 'id');
          where.area = In(zoneIds);
        }
      }
      if (data.funds) {
        where.transaction_status = data.funds;
      }
      if (data.transaction_type) {
        where.transaction_to_type = data.transaction_type;
      }
      const transaction = await this.transactionRepository.find({
        where: [
          { ...where, transaction_to: user_id },
          { ...where, transaction_from: user_id },
        ],
        take: take,
        skip: skip,
      });

      const total = await this.transactionRepository.count({
        where: [
          { ...where, transaction_to: user_id },
          { ...where, transaction_from: user_id },
        ],
      });
      const totalPages = Math.ceil(total / data.limit);
      for (let i = 0; i < transaction.length; i++) {
        if (transaction[i].transaction_for_type == TRANSACTION_FOR_TYPE.USER) {
          const transaction_to = await firstValueFrom(
            this.userClient.send<any>('get_user_by_id', {
              userId: Number(transaction[i].transaction_to),
            }),
          );
          transaction[i].transaction_to = transaction_to;
        } else if (
          transaction[i].transaction_for_type == TRANSACTION_FOR_TYPE.COMMUNITY
        ) {
          const transaction_to = await firstValueFrom(
            this.communityClient.send<any>(
              'get_community_by_id',
              Number(transaction[i].transaction_to),
            ),
          );
          transaction[i].transaction_to = transaction_to;
        }
        const created_by = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(transaction[i].created_by),
          }),
        );
        transaction[i].created_by = created_by;
        if (transaction[i] && transaction[i].area) {
          const area = await firstValueFrom(
            this.adminClient.send<any>('get_zone', transaction[i].area),
          );
          transaction[i].area = area;
          delete area.created_by;
          delete area.general_profile;
        }
      }
      return {
        data: transaction,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAnalyticsByTransactionType(
    data: GetAnalyticsByTransactionTypeDto,
    user_id: number,
  ): Promise<Transaction[]> {
    try {
      const sum = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction_amount)', 'total_amount')
        .where('transaction_to = :user_id', { user_id: user_id })
        .andWhere('transaction_status = :transaction_status', {
          transaction_status: TRANSACTION_STATUS.DELIVERED,
        });
      if (data.transaction_type != ANALYTICS_TRANSACTION_TYPE.ALL) {
        sum.andWhere('transaction_to_type = :transaction_to_type', {
          transaction_to_type: data.transaction_type,
        });
      }
      const response = sum.getRawOne();
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(data: CreateTransactionDto, user_id: number): Promise<any> {
    try {
      const transaction_from_user = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(data.transaction_from),
        }),
      );
      let updateFromUser = {};
      if (data.transaction_from_type == TRANSACTION_TYPE.HBB) {
        if (
          transaction_from_user.general_profile.hbb_points <
          data.transaction_amount
        ) {
          return {
            status: 500,
            message: 'No enough HBB.',
          };
        }
        updateFromUser = {
          hbb_points:
            transaction_from_user.general_profile.hbb_points -
            data.transaction_amount,
        };
      }
      if (data.transaction_from_type == TRANSACTION_TYPE.HBS) {
        if (
          transaction_from_user.general_profile.hbs_points <
          data.transaction_amount
        ) {
          return {
            status: 500,
            message: 'No enough HBS.',
          };
        }
        updateFromUser = {
          hbs_points:
            transaction_from_user.general_profile.hbs_points -
            data.transaction_amount,
        };
      }
      const updateData = {
        id: data.transaction_from,
        ...updateFromUser,
      };
      if (data.transaction_from_type != TRANSACTION_TYPE.CURRENCY) {
        await firstValueFrom(
          this.userClient.send<any>(
            'update_general_profile',
            JSON.stringify(updateData),
          ),
        );
      }
      if (data.transaction_for_type == TRANSACTION_FOR_TYPE.USER) {
        const user = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(data.transaction_to),
          }),
        );
        let updateData = {};
        if (data.transaction_from_type == TRANSACTION_TYPE.HBB) {
          updateData = {
            id: data.transaction_to,
            hbb_points:
              user.general_profile.hbb_points + data.transaction_amount,
          };
        }
        if (data.transaction_from_type == TRANSACTION_TYPE.HBS) {
          updateData = {
            id: data.transaction_to,
            hbs_points:
              user.general_profile.hbs_points + data.transaction_amount,
          };
        }
        if (data.transaction_from_type != TRANSACTION_TYPE.CURRENCY) {
          await firstValueFrom(
            this.userClient.send<any>(
              'update_general_profile',
              JSON.stringify(updateData),
            ),
          );
        }
      }
      if (data.transaction_for_type == TRANSACTION_FOR_TYPE.CLAIM_PRIZE) {
        const user = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(data.transaction_to),
          }),
        );
        let updateData = {};
        if (data.transaction_from_type == TRANSACTION_TYPE.HBB) {
          updateData = {
            id: data.transaction_to,
            hbb_points:
              user.general_profile.hbb_points + data.transaction_amount,
          };
        }
        if (data.transaction_from_type == TRANSACTION_TYPE.HBS) {
          updateData = {
            id: data.transaction_to,
            hbs_points:
              user.general_profile.hbs_points + data.transaction_amount,
          };
        }
        if (data.transaction_from_type != TRANSACTION_TYPE.CURRENCY) {
          await firstValueFrom(
            this.userClient.send<any>(
              'update_general_profile',
              JSON.stringify(updateData),
            ),
          );
        }
        if (data.contest_prizes_id) {
          updateData = {
            id: data.transaction_to,
            contest_prizes: data.contest_prizes_id,
          };
          const claimPrize = await firstValueFrom(
            this.communityClient.send<any>(
              'add_contest_claim_prize',
              JSON.stringify(updateData),
            ),
          );

          if (
            claimPrize.status &&
            claimPrize.status == 500 &&
            claimPrize.message === 'No Contest Prize Found'
          ) {
            return claimPrize;
          }
          if (
            claimPrize.status &&
            claimPrize.status == 500 &&
            claimPrize.message === 'You already claimed this prize'
          ) {
            return claimPrize;
          }

          await firstValueFrom(
            this.communityClient.send<any>(
              'update_is_claimed',
              JSON.stringify(updateData),
            ),
          );
        }
      }
      if (data.transaction_for_type == TRANSACTION_FOR_TYPE.COMMUNITY) {
        const community = await firstValueFrom(
          this.communityClient.send<any>(
            'get_community_by_id',
            Number(data.transaction_to),
          ),
        );
        let updateData = {};
        if (data.transaction_from_type == TRANSACTION_TYPE.HBB) {
          updateData = {
            id: data.transaction_to,
            hbb_points: community.hbb_points + data.transaction_amount,
          };
        }
        if (data.transaction_from_type == TRANSACTION_TYPE.HBS) {
          updateData = {
            id: data.transaction_to,
            hbs_points: community.hbs_points + data.transaction_amount,
          };
        }
        await firstValueFrom(
          this.communityClient.send<any>(
            'update_community',
            JSON.stringify(updateData),
          ),
        );
      }
      const transaction = new Transaction();
      transaction.transaction_id = await this.generateTransactionId();
      transaction.transaction_from_type = data.transaction_from_type;
      transaction.transaction_to_type = data.transaction_to_type;
      transaction.transaction_amount = data.transaction_amount;
      transaction.area = data.area;
      transaction.transaction_from = data.transaction_from;
      transaction.transaction_to = data.transaction_to;
      transaction.operation_type = data.operation_type;
      transaction.transaction_for_type = data.transaction_for_type;
      transaction.contest_prizes_id = data.contest_prizes_id;
      transaction.transaction_status = TRANSACTION_STATUS.DELIVERED;
      transaction.created_by = user_id;
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createAdminTransaction(
    data: CreateTransactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const transaction = new Transaction();
      transaction.transaction_id = await this.generateTransactionId();
      transaction.transaction_from_type = data.transaction_from_type;
      transaction.transaction_to_type = data.transaction_to_type;
      transaction.transaction_amount = data.transaction_amount;
      transaction.area = data.area;
      transaction.transaction_from = data.transaction_from;
      transaction.transaction_to = data.transaction_to;
      transaction.operation_type = data.operation_type;
      transaction.transaction_for_type = data.transaction_for_type;
      transaction.transaction_status = TRANSACTION_STATUS.DELIVERED;
      transaction.created_by = user_id;
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(
    id: number,
    data: UpdateTransactionDto,
    user_id: number,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id,
        created_by: user_id,
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    Object.assign(transaction, data);
    return await this.transactionRepository.save(transaction);
  }

  async remove(id: number, user_id: number): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id,
        created_by: user_id,
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    await this.transactionRepository.delete(id);
  }

  async generateTransactionId(): Promise<string> {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
  }
}
