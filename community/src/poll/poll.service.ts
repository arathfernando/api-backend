import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import {
  POST_TYPE,
  POST_LOCATION,
  POLL_STATUS,
} from 'src/core/constant/enum.constant';
import { AnswerPollDto } from 'src/core/dtos/poll/answer-poll.dto';
import { CreatePollDto } from 'src/core/dtos/poll/create-poll.dto';
import {
  Community,
  CommunityGroup,
  CommunityGroupTimeline,
  CommunityPoll,
  CommunityPollAnswers,
  CommunityPollOptions,
  CommunityTimeline,
  CommunityTopic,
  GroupActivity,
} from 'src/database/entities';
import { In, Repository } from 'typeorm';

@Injectable()
export class PollService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(CommunityPoll)
    private readonly communityPollRepository: Repository<CommunityPoll>,
    @InjectRepository(CommunityPollOptions)
    private readonly pollOptionRepository: Repository<CommunityPollOptions>,
    @InjectRepository(CommunityTimeline)
    private readonly timelineRepository: Repository<CommunityTimeline>,
    @InjectRepository(CommunityGroupTimeline)
    private readonly groupTimelineRepository: Repository<CommunityGroupTimeline>,
    @InjectRepository(CommunityPollAnswers)
    private readonly pollAnswerRepository: Repository<CommunityPollAnswers>,
    @InjectRepository(GroupActivity)
    private readonly groupActivityRepository: Repository<GroupActivity>,
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
  ) {}

  public async createPoll(data: CreatePollDto, user_id: number): Promise<any> {
    try {
      let group = null;
      let community = null;

      if (data.post_location === POST_LOCATION.COMMUNITY) {
        community = await this.communityRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!community) {
          throw new HttpException(
            'COMMUNITY_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      if (data.post_location === POST_LOCATION.GROUP) {
        group = await this.communityGroupRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!group) {
          throw new HttpException(
            'GROUP_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      const poll = new CommunityPoll();
      poll.community = community;
      poll.description = data.description;
      poll.question = data.question;
      poll.created_by = user_id;
      poll.group = group ? group : null;
      poll.poll_status = data.poll_status;
      poll.poll_location = data.post_location;

      const createdPoll = await this.communityPollRepository.save(poll);

      for (let i = 0; i < data.options.length; i++) {
        const opt = new CommunityPollOptions();
        opt.option = data.options[i].option;
        opt.poll = createdPoll;

        await this.pollOptionRepository.save(opt);
      }
      if (data.post_location === POST_LOCATION.COMMUNITY) {
        const timeline = new CommunityTimeline();
        timeline.community_id = community.id;
        timeline.created_by = user_id;
        timeline.post_id = createdPoll.id;
        timeline.post_type = POST_TYPE.POLL;

        await this.timelineRepository.save(timeline);
      }

      if (data.post_location === POST_LOCATION.GROUP) {
        const timeline = new CommunityGroupTimeline();
        timeline.group_id = group.id;
        timeline.created_by = user_id;
        timeline.post_id = createdPoll.id;
        timeline.post_type = POST_TYPE.POLL;

        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_id', {
            userId: user_id,
          }),
        );
        const groupActivity = new GroupActivity();
        groupActivity.group = group;
        groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} Create a Poll in Group ${group.group_name}`;
        await this.groupActivityRepository.save(groupActivity);

        await this.groupTimelineRepository.save(timeline);
      }

      return await this.communityPollRepository.findOne({
        where: { id: createdPoll.id },
        relations: ['options'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private findObject(arr, value, return_type) {
    const element = arr.find((val) => {
      return Number(val.user_id) === Number(value);
    });

    if (return_type === 'bool') {
      return typeof element === 'undefined' ? false : true;
    } else {
      return element;
    }
  }
  public async updatePoll(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const poll = await this.communityPollRepository.findOne({
        where: { id: id, created_by: user_id },
        relations: ['options'],
      });

      if (!poll) {
        throw new HttpException(
          'POLL_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      for (let i = 0; i < poll.options.length; i++) {
        if (data.options.length > 0) {
          Promise.all(
            data.options.map(async (option) => {
              const findOption = await this.pollOptionRepository.findOne({
                where: {
                  id: poll.options[i].id,
                },
              });

              if (!findOption) {
                throw new HttpException(
                  'POLL_NOT_FOUND',
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              }
              await this.pollOptionRepository.update(findOption.id, option);
            }),
          );
        }
      }

      if (data.topics && data.topics != '') {
        const topicIds = data.topics.split(',');

        const topics = await this.communityTopicRepository.find({
          where: {
            id: In(topicIds),
          },
        });
        poll.topics = topics;
      }

      if (data.description) {
        poll.description = data.description;
      }
      if (data.question) {
        poll.question = data.question;
      }
      if (data.post_location) {
        poll.poll_location = data.post_location;
      }

      await this.communityPollRepository.save(poll);
      return {
        message: 'Poll updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPollById(id: number): Promise<any> {
    try {
      const poll = await this.communityPollRepository.findOne({
        where: { id: id },
        relations: ['options'],
      });

      return poll;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePoll(id: number, user_id: number): Promise<any> {
    try {
      const poll = await this.communityPollRepository.findOne({
        where: { id: id, created_by: user_id },
        relations: ['options'],
      });

      const timeline = await this.timelineRepository.findOne({
        where: {
          post_id: id,
          created_by: user_id,
        },
      });

      if (!poll) {
        throw new HttpException(
          'POLL_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (timeline) {
        await this.timelineRepository.delete(timeline.id);
      }
      await this.communityPollRepository.update(id, {
        poll_status: POLL_STATUS.REMOVE,
      });

      const invitedUser = await firstValueFrom(
        this.userClient.send('get_user_by_id', {
          userId: user_id,
        }),
      );
      const groupActivity = new GroupActivity();
      groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} Delete a Poll in Group`;
      await this.groupActivityRepository.save(groupActivity);

      return {
        message: 'Poll deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async answerPoll(
    id: number,
    data: AnswerPollDto,
    user_id: number,
  ): Promise<any> {
    try {
      const poll = await this.communityPollRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!poll) {
        throw new HttpException(
          'POLL_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const pollOption = await this.pollOptionRepository.findOne({
        where: {
          id: data.selected_option_id,
          poll: {
            id: poll.id,
          },
        },
      });

      if (!pollOption) {
        throw new HttpException(
          'POLL_OPTION_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const checkAlreadyAnswered = await this.pollAnswerRepository.findOne({
        where: {
          poll: {
            id: poll.id,
          },
          user_id: user_id,
        },
      });

      if (!checkAlreadyAnswered) {
        const pollAns = new CommunityPollAnswers();
        pollAns.option = pollOption;
        pollAns.poll = poll;
        pollAns.user_id = user_id;

        await this.pollAnswerRepository.save(pollAns);
      } else {
        await this.pollAnswerRepository.delete(checkAlreadyAnswered.id);
        const pollAns = new CommunityPollAnswers();
        pollAns.option = pollOption;
        pollAns.poll = poll;
        pollAns.user_id = user_id;
        await this.pollAnswerRepository.save(pollAns);
      }

      return {
        message: 'Poll answer submitted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
