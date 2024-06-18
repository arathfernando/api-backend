import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import AreaShare from 'src/database/entities/area.entity';
import Area from 'src/database/entities/area.entity';
import AssignPrice from 'src/database/entities/assign-price.entity';
import AssignShare from 'src/database/entities/assign-share.entity';
import GrabShare from 'src/database/entities/grab-share.entity';
import Zone from 'src/database/entities/zone.entity';
import { ASSIGN_SHARE_FILTER, SHARE_METHOD } from 'src/helper/constant';
import {
  CreateAreaDTO,
  CreateAssignPriceDTO,
  CreateAssignShareDTO,
  CreateZoneDTO,
  GetAssignShareDto,
  GrabShareDTO,
  UpdateAreaDTO,
  UpdateAssignPriceDTO,
  UpdateAssignShareDTO,
  UpdateZoneDTO,
} from 'src/helper/dtos';
import {
  ILike,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  Repository,
} from 'typeorm';
import { GetUserAssignShareDto } from 'src/helper/dtos/get-user-assign-share.dto';
import { IMailPayload } from 'src/helper/interfaces';
import { GetByIdOptionalDto } from 'src/helper/dtos/get-by-id-optional.dto';
import { InjectRepository } from '@nestjs/typeorm';
import AdminNotification from 'src/database/entities/admin-notification.entity';

@Injectable()
export class InvestorService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
    @InjectRepository(AdminNotification)
    private readonly adminNotificationRepository: Repository<AdminNotification>,
    @InjectRepository(AreaShare)
    private readonly areaShareRepository: Repository<AreaShare>,
    @InjectRepository(AssignShare)
    private readonly assignShareRepository: Repository<AssignShare>,
    @InjectRepository(AssignPrice)
    private readonly assignPriceRepository: Repository<AssignPrice>,
    @InjectRepository(GrabShare)
    private readonly grabShareRepository: Repository<GrabShare>,
  ) {
    this.mailClient.connect();
    this.userClient.connect();
  }

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  async zoneShare(id: number, user_id: number): Promise<any> {
    const whereCOnn: any = {
      where: {},
      relations: ['area_share_id'],
    };
    if (id != 0) {
      whereCOnn.where.id = id;
    }
    const zone = await this.zoneRepository.find(whereCOnn);
    const zoneRes: any = [...zone];
    for (let i = 0; i < zoneRes.length; i++) {
      zoneRes[i].created_by = await this.getUser(zoneRes[i].created_by);
      zoneRes[i].user_shares = await this.assignShareRepository.find({
        where: {
          share_area: zoneRes[i].area_share_id.id,
          user: user_id,
        },
      });
    }
    return zoneRes;
  }

  async findAllZones(): Promise<any> {
    const zone = await this.zoneRepository.find();
    const zoneRes: any = [...zone];

    for (let i = 0; i < zoneRes.length; i++) {
      zoneRes[i].created_by = await this.getUser(zoneRes[i].created_by);
    }
    return zoneRes;
  }

  async findOneZone(id: number): Promise<any> {
    const zoneRes: any = await this.zoneRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!zoneRes) {
      return {
        status: 500,
        message: 'No zone found.',
      };
    }
    zoneRes.created_by = await this.getUser(zoneRes.created_by);
    return zoneRes;
  }

  async findOneZoneByCommunityId(id: number): Promise<any> {
    const zoneRes: any = await this.zoneRepository.find({
      where: {
        community_id: id,
      },
    });
    return zoneRes;
  }

  async findOneShareArea(id: number): Promise<any> {
    const areaShareRes: any = await this.areaShareRepository.findOne({
      where: {
        id: id,
      },
      relations: ['zone'],
    });
    if (!areaShareRes) {
      return {
        status: 500,
        message: 'No area share found.',
      };
    }
    return areaShareRes;
  }
  async findAssignPrice(id: number): Promise<any> {
    const prices = await this.assignPriceRepository.find({
      where: {
        area_share: {
          id: id,
        },
      },
    });
    return prices;
  }

  async createZone(createZoneDto: CreateZoneDTO): Promise<Zone> {
    const zone = new Zone();
    zone.area_name = createZoneDto.area_name;
    zone.subarea_name = createZoneDto.subarea_name;
    zone.created_by = createZoneDto.created_by;
    zone.community_id = createZoneDto.community_id;
    zone.created_at_date = createZoneDto.created_at_date;
    return await this.zoneRepository.save(zone);
  }

  async updateZone(id: number, updateZoneDto: UpdateZoneDTO): Promise<any> {
    const zone = await this.zoneRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!zone) {
      return {
        status: 500,
        message: 'No zone found.',
      };
    }
    zone.area_name = updateZoneDto.area_name;
    zone.community_id = updateZoneDto.community_id;
    zone.subarea_name = updateZoneDto.subarea_name;
    zone.created_at_date = updateZoneDto.created_at_date;
    return await this.zoneRepository.save(zone);
  }

  async deleteZone(id: number): Promise<any> {
    await this.zoneRepository.delete(id);

    return {
      status: 200,
      message: 'Zone deleted successfully',
    };
  }

  async findAllAreas(data: GetByIdOptionalDto): Promise<any> {
    const area: any = await this.areaShareRepository.find({
      relations: ['zone'],
    });
    for (let i = 0; i < area.length; i++) {
      const whereConn: any = {
        where: {
          share_area: area[i].id,
        },
      };
      if (data.id) {
        whereConn.where.user = data.id;
      }
      area[i].user_shares = await this.assignShareRepository.find(whereConn);
    }
    return area;
  }

  async findOneArea(id: number): Promise<Area> {
    const areaRes: any = await this.areaShareRepository.findOne({
      where: {
        id: id,
      },
    });
    areaRes.zone = await this.zoneRepository.findOne({
      where: { id: areaRes.zone },
    });
    return areaRes;
  }

  async createArea(createAreaDto: CreateAreaDTO): Promise<any> {
    const zone = await this.zoneRepository.findOne({
      where: {
        id: createAreaDto.zone,
      },
    });
    if (!zone) {
      return {
        status: 500,
        message: 'No zone found.',
      };
    }
    const area = new AreaShare();
    area.zone = zone;
    area.share_percentage = createAreaDto.share_percentage;
    area.amount_share = createAreaDto.amount_share;
    area.expected_start_date = createAreaDto.expected_start_date;
    area.global_share = createAreaDto.global_share;
    const areaUpdate = await this.areaShareRepository.save(area);
    await this.zoneRepository.update(createAreaDto.zone, {
      area_share_id: areaUpdate,
    });
    return areaUpdate;
  }

  async updateArea(id: number, updateAreaDto: UpdateAreaDTO): Promise<any> {
    const area = await this.areaShareRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!area) {
      return {
        status: 500,
        message: 'No area share found.',
      };
    }
    const updateData: any = { ...updateAreaDto };
    await this.areaShareRepository.update(id, updateData);
    return await this.areaShareRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async deleteArea(id: number): Promise<any> {
    const area_share = await this.areaShareRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!area_share) {
      return {
        status: 500,
        message: 'No area share found.',
      };
    }
    const prices = await this.assignPriceRepository.find({
      where: {
        area_share: area_share,
      },
    });
    const price_id = await this.arrayColumn(prices, 'id');
    await this.assignShareRepository.delete({
      share_price: In(price_id),
    });
    await this.assignPriceRepository.delete({
      area_share: area_share,
    });
    await this.areaShareRepository.delete(id);
    return {
      status: 200,
      message: 'Area deleted successfully',
    };
  }

  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  async findAllAssignShares(data: GetAssignShareDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    let where = {};
    let areaShare = [];
    if (data.search && !data.filter) {
      const userData = await this.assignShareRepository.query(
        `SELECT * from general_profile WHERE LOWER(first_name) LIKE LOWER('%${data.search}%') OR LOWER(last_name) LIKE LOWER('%${data.search}%')`,
      );
      const zone = await this.assignShareRepository.query(
        `SELECT * from zones WHERE LOWER(area_name) LIKE LOWER('%${data.search}%') OR LOWER(subarea_name) LIKE LOWER('%${data.search}%')`,
      );
      const zoneIds = await this.arrayColumn(zone, 'id');
      areaShare = await this.areaShareRepository.find({
        where: {
          zone: {
            id: In(zoneIds),
          },
        },
      });
      const areaShareIds = await this.arrayColumn(areaShare, 'id');
      const userIds = await this.arrayColumn(userData, 'user_id');
      where = {
        where: [{ user: In(userIds) }, { share_area: In(areaShareIds) }],
      };
    } else if (data.search && data.filter) {
      if (data.filter == ASSIGN_SHARE_FILTER.USER) {
        const userData = await this.assignShareRepository.query(
          `SELECT * from general_profile WHERE LOWER(first_name) LIKE LOWER('%${data.search}%') OR LOWER(last_name) LIKE LOWER('%${data.search}%')`,
        );
        const userIds = await this.arrayColumn(userData, 'user_id');
        where = {
          where: [{ user: In(userIds) }],
        };
      }
      if (data.filter == ASSIGN_SHARE_FILTER.AREA) {
        const zone = await this.assignShareRepository.query(
          `SELECT * from zones WHERE LOWER(area_name) LIKE LOWER('%${data.search}%')`,
        );
        const zoneIds = await this.arrayColumn(zone, 'id');
        areaShare = await this.areaShareRepository.find({
          where: {
            zone: {
              id: In(zoneIds),
            },
          },
        });
        const areaShareIds = await this.arrayColumn(areaShare, 'id');
        where = {
          where: [{ share_area: In(areaShareIds) }],
        };
      }
      if (data.filter == ASSIGN_SHARE_FILTER.SUBAREA) {
        const zone = await this.assignShareRepository.query(
          `SELECT * from zones WHERE LOWER(subarea_name) LIKE LOWER('%${data.search}%')`,
        );
        const zoneIds = await this.arrayColumn(zone, 'id');
        areaShare = await this.areaShareRepository.find({
          where: {
            zone: {
              id: In(zoneIds),
            },
          },
        });
        const areaShareIds = await this.arrayColumn(areaShare, 'id');
        where = {
          where: [{ share_area: In(areaShareIds) }],
        };
      }
    }
    const assignShare: any = await this.assignShareRepository.find({
      order: {
        id: 'DESC',
      },
      take: newD.take,
      skip: newD.skip,
      ...where,
    });
    const extra_data: any = [];
    if (!assignShare.length) {
      return {
        status: 500,
        message: 'No user share found.',
      };
    }
    for (let i = 0; i < assignShare.length; i++) {
      const areaShare = await this.areaShareRepository.findOne({
        where: {
          id: assignShare[i].share_area,
        },
        relations: ['zone'],
      });
      let price = assignShare[i].share_value;
      if (assignShare[i].share_value == '' || assignShare[i].share_value == 0) {
        const areaSharePrice = await this.assignPriceRepository.findOne({
          where: {
            id: assignShare[i].share_price,
          },
        });
        assignShare[i].share_price = areaSharePrice;
        price = areaSharePrice.price_share;
      }
      assignShare[i].user = await this.getUser(assignShare[i].user);
      assignShare[i].share_area = areaShare;
      assignShare[i].percent_of_share_by_area =
        100 *
        (Number(assignShare[i].share_qty) / Number(areaShare.amount_share));
      assignShare[i].price_paid_usd = assignShare[i].share_qty * price;
    }
    if (data.filter == ASSIGN_SHARE_FILTER.SUBAREA && assignShare.length) {
      const areaShareQty = await this.arrayColumn(areaShare, 'amount_share');
      const areaSharePercentageQty = await this.arrayColumn(
        areaShare,
        'share_percentage',
      );
      extra_data['number_of_hbs'] = areaShareQty.length
        ? areaShareQty.reduce((a, b) => a + b)
        : 0;
      extra_data['percentage_distributed'] = areaSharePercentageQty.length
        ? areaSharePercentageQty.reduce((a, b) => a + b)
        : 0;
      const currentDate = new Date().toISOString();
      const areaShareIds = await this.arrayColumn(areaShare, 'id');
      const currentSharePrice = await this.assignPriceRepository.findOne({
        where: {
          area_share: In(areaShareIds),
          from_which_date: LessThanOrEqual(currentDate),
        },
        order: {
          from_which_date: 'DESC',
        },
      });
      const pricePaidUsd = await this.arrayColumn(
        assignShare,
        'price_paid_usd',
      );
      extra_data['gain_value_usd'] =
        currentSharePrice.price_share * extra_data['number_of_hbs'] -
        pricePaidUsd.reduce((a, b) => a + b) * extra_data['number_of_hbs'];
      extra_data['gain_value_usd_percentage'] =
        (100 * extra_data['gain_value_usd']) / extra_data['number_of_hbs'];
    }
    return {
      data: assignShare,
      extra_data: { ...extra_data },
    };
  }

  async assignShareByUser(id, data: GetUserAssignShareDto): Promise<any> {
    let areaShare = [];
    const whereConn: any = {
      where: {
        user: id,
      },
    };
    if (data.search && !data.filter) {
      const zone = await this.assignShareRepository.query(
        `SELECT * from zones WHERE LOWER(area_name) LIKE LOWER('%${data.search}%') OR LOWER(subarea_name) LIKE LOWER('%${data.search}%')`,
      );
      const zoneIds = await this.arrayColumn(zone, 'id');
      const areaShare = await this.areaShareRepository.find({
        where: {
          zone: {
            id: In(zoneIds),
          },
        },
      });
      const areaShareIds = await this.arrayColumn(areaShare, 'id');
      whereConn.where.share_area = In(areaShareIds);
    } else if (data.search && data.filter) {
      if (data.filter == ASSIGN_SHARE_FILTER.AREA) {
        const zone = await this.assignShareRepository.query(
          `SELECT * from zones WHERE LOWER(area_name) LIKE LOWER('%${data.search}%')`,
        );
        const zoneIds = await this.arrayColumn(zone, 'id');
        areaShare = await this.areaShareRepository.find({
          where: {
            zone: {
              id: In(zoneIds),
            },
          },
        });
        const areaShareIds = await this.arrayColumn(areaShare, 'id');
        whereConn.where.share_area = In(areaShareIds);
      }
      if (data.filter == ASSIGN_SHARE_FILTER.SUBAREA) {
        const zone = await this.assignShareRepository.query(
          `SELECT * from zones WHERE LOWER(subarea_name) LIKE LOWER('%${data.search}%')`,
        );
        const zoneIds = await this.arrayColumn(zone, 'id');
        areaShare = await this.areaShareRepository.find({
          where: {
            zone: {
              id: In(zoneIds),
            },
          },
        });
        const areaShareIds = await this.arrayColumn(areaShare, 'id');
        whereConn.where.share_area = In(areaShareIds);
      }
    }
    const userShare: any = await this.assignShareRepository.find(whereConn);
    if (!userShare.length) {
      return {
        status: 500,
        message: 'No assigned share found.',
      };
    }
    let current_value_of_share = 0;
    for (let i = 0; i < userShare.length; i++) {
      const areaShare = await this.areaShareRepository.findOne({
        where: {
          id: userShare[i].share_area,
        },
        relations: ['zone'],
      });
      const currentDate = new Date().toISOString();
      const currentSharePrice = await this.assignPriceRepository.findOne({
        where: {
          area_share: {
            id: areaShare.id,
          },
          from_which_date: LessThanOrEqual(currentDate),
        },
        order: {
          from_which_date: 'DESC',
        },
      });
      userShare[i].share_area = areaShare;
      userShare[i].gain_value =
        (currentSharePrice.price_share - userShare[i].share_value) *
        userShare[i].share_qty;
      userShare[i].price_paid_usd =
        userShare[i].share_qty * userShare[i].share_value;
      userShare[i].price_to_date =
        userShare[i].share_qty * currentSharePrice.price_share;
      userShare[i].total_increase =
        (100 * (userShare[i].price_to_date - userShare[i].price_paid_usd)) /
        userShare[i].price_paid_usd;
      const current_date = new Date();
      const invested_date = new Date(userShare[i].start_date);
      const difference_in_time =
        current_date.getTime() - invested_date.getTime();
      const difference_in_day = Math.round(
        difference_in_time / (1000 * 3600 * 24),
      );
      userShare[i].number_of_days_invested = difference_in_day;
      userShare[i].annual_return =
        (1 + userShare[i].total_increase / 100) ** (365 / difference_in_day) -
        1;
      current_value_of_share =
        current_value_of_share + userShare[i].price_to_date;
    }
    const extra_data = [];
    const userShareQty = await this.arrayColumn(userShare, 'share_qty');
    extra_data['number_of_hbs'] = userShareQty.reduce((a, b) => a + b);
    extra_data['current_value_of_share'] = current_value_of_share;
    const totalIncrease = await this.arrayColumn(userShare, 'gain_value');
    extra_data['gain_value_usd'] = totalIncrease.reduce((a, b) => a + b);
    extra_data['gain_value_usd_percentage'] =
      (100 * extra_data['gain_value_usd']) / extra_data['number_of_hbs'];
    return {
      data: userShare,
      extra_data: { ...extra_data },
    };
  }

  async getAssignShareByUser(id, data: any): Promise<any> {
    let searchWhere = {};
    if (data.search) {
      const zone = await this.assignShareRepository.query(
        `SELECT * from zones WHERE LOWER(area_name) LIKE LOWER('%${data.search}%') OR LOWER(subarea_name) LIKE LOWER('%${data.search}%')`,
      );
      const zoneIds = await this.arrayColumn(zone, 'id');
      const areaShare = await this.areaShareRepository.find({
        where: {
          zone: {
            id: In(zoneIds),
          },
        },
      });
      const areaShareIds = await this.arrayColumn(areaShare, 'id');
      searchWhere = {
        share_area: In(areaShareIds),
      };
    }
    const skip = data.limit * data.page - data.limit;
    const whereConn: any = {
      where: {
        user: id,
        ...searchWhere,
      },
      limit: data.limit,
      skip: skip,
    };
    if (data.minDate) {
      whereConn.where.start_date = MoreThan(data.minDate);
    }
    if (data.maxDate) {
      whereConn.where.start_date = LessThan(data.maxDate);
    }
    const userShare: any = await this.assignShareRepository.find(whereConn);

    if (!userShare || userShare.length <= 0) {
      return {
        status: 500,
        message: 'No assigned share found.',
      };
    }
    for (let i = 0; i < userShare.length; i++) {
      const areaShare = await this.areaShareRepository.findOne({
        where: {
          id: userShare[i].share_area,
        },
        relations: ['zone'],
      });
      let price = userShare[i].share_value;
      if (userShare[i].share_value == '' || userShare[i].share_value == 0) {
        const areaSharePrice = await this.assignPriceRepository.findOne({
          where: {
            id: userShare[i].share_price,
          },
        });
        userShare[i].share_price = areaSharePrice;
        price = areaSharePrice.price_share;
      }
      const currentDate = new Date().toISOString();
      const currentSharePrice = await this.assignPriceRepository.findOne({
        where: {
          area_share: {
            id: areaShare.id,
          },
          from_which_date: LessThanOrEqual(currentDate),
        },
        order: {
          from_which_date: 'DESC',
        },
      });
      userShare[i].share_area = areaShare;
      userShare[i].gain_value =
        (currentSharePrice.price_share - price) * userShare[i].share_qty;
      userShare[i].price_paid_usd = userShare[i].share_qty * price;
      userShare[i].price_to_date =
        userShare[i].share_qty * currentSharePrice.price_share;
      userShare[i].total_increase =
        (100 * (userShare[i].price_to_date - userShare[i].price_paid_usd)) /
        userShare[i].price_paid_usd;
      const current_date = new Date();
      const invested_date = new Date(userShare[i].start_date);
      const difference_in_time =
        current_date.getTime() - invested_date.getTime();
      const difference_in_day = Math.round(
        difference_in_time / (1000 * 3600 * 24),
      );
      userShare[i].number_of_days_invested = difference_in_day;
      userShare[i].annual_return =
        (1 + userShare[i].total_increase / 100) ** (365 / difference_in_day) -
        1;
    }
    const total = await this.assignShareRepository.count({
      where: whereConn.where,
    });
    const totalPages = Math.ceil(total / data.limit);
    return {
      data: userShare,
      page: data.page,
      limit: data.limit,
      total_pages: totalPages,
      count: total,
    };
  }

  async assignShareByUserAndZone(id, zone_id: number): Promise<any> {
    let searchWhere = {};
    const zoneWhere = zone_id != 0 ? { where: { id: zone_id } } : {};
    const zone = await this.zoneRepository.find({
      ...zoneWhere,
    });
    const zoneIds = await this.arrayColumn(zone, 'id');
    const areaShare = await this.areaShareRepository.find({
      where: {
        zone: {
          id: In(zoneIds),
        },
      },
    });
    const areaShareIds = await this.arrayColumn(areaShare, 'id');
    searchWhere = {
      share_area: In(areaShareIds),
    };
    const userShare: any = await this.assignShareRepository.find({
      where: {
        user: id,
        ...searchWhere,
      },
    });
    if (!userShare || userShare.length <= 0) {
      return {
        status: 500,
        message: 'No assigned share found.',
      };
    }
    for (let i = 0; i < userShare.length; i++) {
      const areaShare = await this.areaShareRepository.findOne({
        where: {
          id: userShare[i].share_area,
        },
        relations: ['zone'],
      });
      const price = userShare[i].share_value;
      const currentDate = new Date().toISOString();
      const currentSharePrice = await this.assignPriceRepository.findOne({
        where: {
          area_share: {
            id: areaShare.id,
          },
          from_which_date: LessThanOrEqual(currentDate),
        },
        order: {
          from_which_date: 'DESC',
        },
      });
      userShare[i].share_area = areaShare;
      userShare[i].current_zone_price = currentSharePrice;
      userShare[i].gain_value =
        (currentSharePrice.price_share - price) * userShare[i].share_qty;
      userShare[i].price_paid_usd = userShare[i].share_qty * price;
      userShare[i].price_to_date =
        userShare[i].share_qty * currentSharePrice.price_share;
      userShare[i].total_increase =
        (100 * (userShare[i].price_to_date - userShare[i].price_paid_usd)) /
        userShare[i].price_paid_usd;
      const current_date = new Date();
      const invested_date = new Date(userShare[i].start_date);
      const difference_in_time =
        current_date.getTime() - invested_date.getTime();
      const difference_in_day = Math.round(
        difference_in_time / (1000 * 3600 * 24),
      );
      userShare[i].number_of_days_invested = difference_in_day;
      userShare[i].annual_return =
        (1 + userShare[i].total_increase / 100) ** (365 / difference_in_day) -
        1;
    }
    return userShare;
  }

  async getInvestorByZone(zone_id: number): Promise<any> {
    let searchWhere = {};
    const zoneWhere = zone_id != 0 ? { where: { id: zone_id } } : {};
    const zone = await this.zoneRepository.find({
      ...zoneWhere,
      relations: ['area_share_id'],
    });
    const areaShare = await this.arrayColumn(zone, 'area_share_id');
    const areaShareIds = await this.arrayColumn(areaShare, 'id');
    searchWhere = {
      share_area: In(areaShareIds),
    };
    const userShare: any = await this.assignShareRepository.find({
      where: {
        ...searchWhere,
      },
    });

    return userShare;
  }

  async createAssignShare(
    createAssignShareDto: CreateAssignShareDTO,
  ): Promise<any> {
    const user = await this.getUser(createAssignShareDto.user);
    if (!user) {
      return {
        status: 500,
        message: 'No user found.',
      };
    }
    const areaShare: any = await this.areaShareRepository.findOne({
      where: {
        zone: {
          id: createAssignShareDto.zone,
        },
      },
    });

    const zone: any = await this.zoneRepository.findOne({
      where: {
        id: createAssignShareDto.zone,
      },
    });
    if (!areaShare) {
      return {
        status: 500,
        message: 'No area share found.',
      };
    }
    const areaSharePrice: any = await this.assignPriceRepository.findOne({
      where: {
        area_share: areaShare.id,
        from_which_date: LessThanOrEqual(createAssignShareDto.start_date),
      },
      order: {
        from_which_date: 'DESC',
      },
    });
    if (!areaSharePrice) {
      return {
        status: 500,
        message: 'No assign area share price found.',
      };
    }
    const assignShare = new AssignShare();
    assignShare.user = createAssignShareDto.user;
    assignShare.global_share = createAssignShareDto.global_share;
    assignShare.share_area = areaShare.id;
    assignShare.share_price = areaSharePrice.id;
    assignShare.share_qty = createAssignShareDto.share_qty;
    assignShare.share_value = createAssignShareDto.share_value;
    assignShare.start_date = createAssignShareDto.start_date;
    assignShare.share_method = SHARE_METHOD.INITIAL;
    await this.assignShareRepository.save(assignShare);
    const createTransaction = {
      transaction_from_type: 'HBS',
      transaction_to_type: 'HBS',
      transaction_amount:
        createAssignShareDto.share_value * createAssignShareDto.share_qty,
      area: createAssignShareDto.zone,
      transaction_from: 0,
      transaction_to: createAssignShareDto.user,
      operation_type: 'SELL',
      transaction_for_type: 'USER',
      user_id: 0,
    };
    const number = createAssignShareDto.share_qty;
    const commaSeparatedHbs = number.toLocaleString('en-IN');

    await firstValueFrom(
      this.transactionClient.send<any>(
        'create_admin_transaction',
        JSON.stringify(createTransaction),
      ),
    );
    const payload: IMailPayload = {
      template: 'INVITE_INVESTOR',
      payload: {
        emails: [user.email],
        data: {
          area: zone.area_name + ' - ' + zone.subarea_name,
          avatar: user.general_profile.avatar,
          name: `${user.general_profile.first_name} ${user.general_profile.last_name}`,
          hbs_qty: commaSeparatedHbs,
          link: process.env.INVESTOR_URL,
        },
        subject: `You got invited as an shareholder at Hubbers.`,
      },
    };
    this.mailClient.emit('send_email', payload);
    return assignShare;
  }

  async updateAssignShare(
    id: number,
    updateAssignShareDto: UpdateAssignShareDTO,
  ): Promise<any> {
    const assignShare = await this.assignShareRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!assignShare) {
      return {
        status: 500,
        message: 'No Assigned share found.',
      };
    }
    if (updateAssignShareDto.user) {
      const user = await this.getUser(updateAssignShareDto.user);
      if (!user) {
        return {
          status: 500,
          message: 'No user found.',
        };
      }
      assignShare.user = user.id;
    }
    if (updateAssignShareDto.zone) {
      const areaShare: any = await this.areaShareRepository.findOne({
        where: {
          zone: {
            id: updateAssignShareDto.zone,
          },
        },
      });
      if (!areaShare) {
        return {
          status: 500,
          message: 'No area assign share found.',
        };
      }

      const areaSharePrice: any = await this.assignPriceRepository.findOne({
        where: {
          area_share: areaShare.id,
          from_which_date: LessThanOrEqual(updateAssignShareDto.start_date),
        },
        order: {
          from_which_date: 'DESC',
        },
      });
      if (!areaSharePrice) {
        return {
          status: 500,
          message: 'No assign area share price found.',
        };
      }
      assignShare.share_area = areaShare.id;
      assignShare.share_price = areaSharePrice.id;
    }
    assignShare.start_date = updateAssignShareDto.start_date
      ? updateAssignShareDto.start_date
      : assignShare.start_date;
    assignShare.share_qty = updateAssignShareDto.share_qty
      ? updateAssignShareDto.share_qty
      : assignShare.share_qty;
    assignShare.share_value = updateAssignShareDto.share_value
      ? updateAssignShareDto.share_value
      : assignShare.share_value;
    assignShare.global_share = updateAssignShareDto.global_share
      ? updateAssignShareDto.global_share
      : assignShare.global_share;
    return await this.assignShareRepository.save(assignShare);
  }

  async deleteAssignShare(id: number): Promise<any> {
    const assignShare = await this.assignShareRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!assignShare) {
      return {
        status: 500,
        message: 'No assign share found.',
      };
    }
    await this.assignShareRepository.delete(id);
    return {
      status: 200,
      message: 'Assign share deleted successfully',
    };
  }

  async findAssignedSharesByUserId(userId: number, data: any): Promise<any> {
    let response: any = await this.assignShareRepository.find({
      where: { user: userId },
    });
    if (!response) {
      return {
        status: 500,
        message: 'No shares found for this user.',
      };
    }
    if (data.search) {
      const shareArea = await this.arrayColumn(response, 'area');
      let area = [];

      if (shareArea.length) {
        area = await this.zoneRepository.find({
          where: [
            { area_name: ILike(`%${data.search}%`) },
            { subarea_name: ILike(`%${data.search}%`) },
          ],
        });
      }
      const searchArea = await this.arrayColumn(area, 'id');
      response = await this.assignShareRepository.find({
        where: {
          share_area: In(searchArea),
          user: userId,
        },
      });
    }
    for (let i = 0; i < response.length; i++) {
      response[i].area = await this.zoneRepository.findOne({
        where: { id: response[i].area },
      });
      response[i].subarea = await this.zoneRepository.findOne({
        where: {
          id: response[i].subarea,
        },
      });
    }
    return response;
  }

  async findAllAssignPrices(data: GetAssignShareDto): Promise<any> {
    const skip = data.limit * data.page - data.limit;
    const newD = {
      take: data.limit,
      skip,
    };
    let searchWhere = {};
    if (data.search) {
      const zone = await this.assignShareRepository.query(
        `SELECT * from zones WHERE LOWER(area_name) LIKE LOWER('%${data.search}%') OR LOWER(subarea_name) LIKE LOWER('%${data.search}%')`,
      );
      const zoneIds = await this.arrayColumn(zone, 'id');
      const areaShare = await this.areaShareRepository.find({
        where: {
          zone: {
            id: In(zoneIds),
          },
        },
      });
      const areaShareIds = await this.arrayColumn(areaShare, 'id');
      searchWhere = {
        where: {
          area_share: In(areaShareIds),
        },
      };
    }
    const response: any = await this.assignPriceRepository.find({
      relations: ['area_share'],
      take: newD.take,
      skip: newD.skip,
      ...searchWhere,
    });
    if (!response.length) {
      return {
        status: 500,
        message: 'No shares found for this user.',
      };
    }

    for (let i = 0; i < response.length; i++) {
      if (response[i].area_share) {
        const areaData = await this.areaShareRepository.findOne({
          where: {
            id: response[i].area_share.id,
          },
          relations: ['zone'],
        });
        response[i].zone = areaData.zone;
        response[i].total_value =
          areaData.amount_share * response[i].price_share;
      }
    }
    return response;
  }

  async createAssignPrice(
    createAssignPriceDto: CreateAssignPriceDTO,
  ): Promise<any> {
    if (createAssignPriceDto.price_share > 100) {
      return {
        status: 500,
        message: 'Share price in unrealistic',
      };
    }
    const area = await this.areaShareRepository.findOne({
      where: {
        zone: {
          id: createAssignPriceDto.zone,
        },
      },
      relations: ['zone'],
    });
    const assignPrice = new AssignPrice();
    assignPrice.area_share = area;
    assignPrice.price_share = createAssignPriceDto.price_share;
    assignPrice.from_which_date = createAssignPriceDto.from_which_date;
    return await this.assignPriceRepository.save(assignPrice);
  }

  async updateAssignPrice(
    id: number,
    updateAssignPriceDto: UpdateAssignPriceDTO,
  ): Promise<any> {
    const assignPrice = await this.assignPriceRepository.findOne({
      where: {
        id: id,
      },
      relations: ['area_share', 'area_share.zone'],
    });
    if (!assignPrice) {
      return {
        status: 500,
        message: 'No assign price found.',
      };
    }
    const old_price = Number(assignPrice.price_share);
    assignPrice.price_share = updateAssignPriceDto.price_share
      ? updateAssignPriceDto.price_share
      : assignPrice.price_share;
    assignPrice.from_which_date = updateAssignPriceDto.from_which_date
      ? updateAssignPriceDto.from_which_date
      : assignPrice.from_which_date;
    await this.assignPriceRepository.save(assignPrice);
    if (updateAssignPriceDto.price_share) {
      const admin_notification = await this.adminNotificationRepository.findOne(
        {
          where: {
            notification_type: 'INVESTOR_PRICE_UPDATE',
          },
        },
      );
      const investor = await this.assignShareRepository.find({
        where: {
          share_area: assignPrice.area_share.id,
        },
      });
      for (let i = 0; i < investor.length; i++) {
        const newDate = new Date(
          updateAssignPriceDto.from_which_date,
        ).toLocaleDateString('en-GB');
        const sumData = await this.assignShareRepository.query(
          `SELECT sum(share_qty) FROM assign_share WHERE user_id = ${investor[i].user} `,
        );
        const invitedUser = await this.getUser(Number(investor[i].user));
        const contestCreateNotification = {
          title: admin_notification.notification_title
            .replace('*investor name*', invitedUser.general_profile.first_name)
            .replace('*area*', assignPrice.area_share.zone.area_name)
            .replace('*new value*', String(updateAssignPriceDto.price_share))
            .replace('*new value*', String(updateAssignPriceDto.price_share))
            .replace('*date*', newDate)
            .replace('*value before*', String(old_price)),
          content: admin_notification.notification_content
            .replace('*investor name*', invitedUser.general_profile.first_name)
            .replace('*area*', assignPrice.area_share.zone.area_name)
            .replace('*new value*', String(updateAssignPriceDto.price_share))
            .replace('*new value*', String(updateAssignPriceDto.price_share))
            .replace('*date*', newDate)
            .replace('*value before*', String(old_price)),
          type: admin_notification.notification_type,
          notification_from: 0,
          notification_to: investor[i].user,
          payload: assignPrice,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(contestCreateNotification),
          ),
        );

        const gainValue =
          (assignPrice.price_share - investor[i].share_value) *
          investor[i].share_qty;
        const globalValue = Number(sumData[0].sum);
        const forecastValue =
          investor[i].share_qty * updateAssignPriceDto.price_share;

        const formatted_value_before = old_price.toFixed(2);
        const formatted_gain_value = gainValue.toFixed(2);
        const formatted_global_value = globalValue.toFixed(2);
        const formatted_forecast_value = forecastValue.toFixed(2);
        const number = investor[i].share_qty;
        const commaSeparatedHbs = number.toLocaleString('en-IN');

        const payload: IMailPayload = {
          template: 'INVESTOR',
          payload: {
            emails: [invitedUser.email],
            data: {
              area:
                assignPrice.area_share.zone.area_name +
                ' - ' +
                assignPrice.area_share.zone.subarea_name,
              avatar: invitedUser.general_profile.avatar,
              name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
              hbs_qty: commaSeparatedHbs,
              global_value: formatted_global_value,
              Forecast_value: formatted_forecast_value,
              gain_value: formatted_gain_value,
              date_today: newDate,
              value_before: String(formatted_value_before),
              new_value: String(updateAssignPriceDto.price_share),
              link: process.env.INVESTOR_URL,
            },
            subject: `You got invited as an shareholder at Hubbers.`,
          },
        };
        this.mailClient.emit('send_email', payload);
      }
    }
    return await this.assignPriceRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async deleteAssignPrice(id: number): Promise<any> {
    const assign_price = await this.assignPriceRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!assign_price) {
      return {
        status: 500,
        message: 'No assign price found.',
      };
    }
    await this.assignShareRepository.delete({
      share_price: id,
    });
    await this.assignPriceRepository.delete(id);
    return {
      status: 200,
      message: 'Assign price deleted successfully',
    };
  }

  async grabShare(data: GrabShareDTO): Promise<any> {
    try {
      const checkInvite = await this.grabShareRepository.findOne({
        where: {
          email: data.email,
        },
      });
      if (checkInvite) {
        return {
          status: 500,
          message: 'You already applied for grab-a-share.',
        };
      }
      const grabShare = new GrabShare();
      grabShare.name = data.name;
      grabShare.email = data.email;
      grabShare.message = data.message;
      await this.grabShareRepository.save(grabShare);
      return {
        status: 200,
        message: 'Successfully applied for grab-a-share.',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserInvestmentZoneList(user_id: number): Promise<any> {
    try {
      const assignShare = await this.assignShareRepository.find({
        where: {
          user: user_id,
        },
      });
      const share_area = await this.arrayColumn(assignShare, 'share_area');
      const area_share = await this.areaShareRepository.find({
        where: {
          id: In(share_area),
        },
        relations: ['zone'],
      });
      const zone = await this.arrayColumn(area_share, 'zone');
      return zone;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
