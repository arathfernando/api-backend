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
  COMMUNITY_INVITE_STATUS,
  COMMUNITY_REQUEST_TYPE,
  EVENT_STATUS,
  POLL_STATUS,
  POST_SHARE_TYPE,
  POST_STATUS,
  POST_TYPE,
  REACTION_TYPE,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import { PostReactionDto } from 'src/core/dtos/post/post-reaction.dto';
import { TimelineFiltersDto } from 'src/core/dtos/timeline-filters.dto';
import {
  CommunityArticle,
  CommunityEvent,
  CommunityGroup,
  CommunityGroupTimeline,
  CommunityLocationPost,
  CommunityPoll,
  CommunityPollAnswers,
  CommunityPost,
  CommunityUser,
  EventAttendees,
  GroupPostHide,
  GroupPostLike,
} from 'src/database/entities';
import { CommunityRequest } from 'src/database/entities/community-request.entity';
import { GroupPostCommentLike } from 'src/database/entities/post-group-comment-like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupTimelineService {
  constructor(
    @Inject('MASTER_CLASS') private readonly masterClassClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PRODUCT_LAUNCHER_SERVICE')
    private readonly productLauncherClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,

    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(CommunityPost)
    private readonly communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityEvent)
    private readonly communityEventRepository: Repository<CommunityEvent>,
    @InjectRepository(EventAttendees)
    private readonly attendEventRepository: Repository<EventAttendees>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(CommunityPoll)
    private readonly communityPollRepository: Repository<CommunityPoll>,
    @InjectRepository(CommunityArticle)
    private readonly communityArticleRepository: Repository<CommunityArticle>,
    @InjectRepository(CommunityRequest)
    private readonly communityRequestRepository: Repository<CommunityRequest>,
    @InjectRepository(CommunityLocationPost)
    private readonly communityLocationPostRepository: Repository<CommunityLocationPost>,
    @InjectRepository(CommunityGroupTimeline)
    private readonly groupTimelineRepository: Repository<CommunityGroupTimeline>,
    @InjectRepository(GroupPostLike)
    private readonly groupPostLikeRepository: Repository<GroupPostLike>,
    @InjectRepository(GroupPostCommentLike)
    private readonly groupPostCommentLikeRepository: Repository<GroupPostCommentLike>,
    @InjectRepository(CommunityPollAnswers)
    private readonly pollAnswerRepository: Repository<CommunityPollAnswers>,
    @InjectRepository(GroupPostHide)
    private readonly postHideRepository: Repository<GroupPostHide>,
  ) {
    this.masterClassClient.connect();
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
  public async getUserWithProfile(
    user_id: number,
    current_user: number,
  ): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_with_profile', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;
    const currencyData = await firstValueFrom(
      this.adminClient.send<any>(
        'get_currency_by_id',
        user.expert_profile.rate_currency,
      ),
    );
    if (user.expert_profile.skills && user.expert_profile.skills.length) {
      const expertSkill = await firstValueFrom(
        this.adminClient.send<any>(
          'get_skill_by_ids',
          JSON.stringify(user.expert_profile.skills),
        ),
      );
      const reviewCount = await this.communityRequestRepository
        .query(`SELECT COUNT(created_by) as count
      FROM user_expertise_review
      WHERE expertise_user_id = ${user.id}
      `);

      const reviewer = await this.communityRequestRepository
        .query(`SELECT created_by , COUNT(created_by) as total
      FROM user_expertise_review
      WHERE expertise_user_id = ${user.id}
      GROUP BY created_by
      ORDER BY total DESC
      `);
      const currentUserStatus = await this.communityRequestRepository
        .query(`SELECT *
      FROM user_expertise_review
      WHERE expertise_user_id = ${user.id}
      AND created_by LIKE '${current_user}'
      ORDER BY id DESC
      LIMIT 1
      `);

      user.expert_profile.current_user_reaction_status =
        currentUserStatus.length ? currentUserStatus[0] : {};
      user.expert_profile.review_count = reviewCount;
      user.expert_profile.reviewer_count = reviewer.length;
      user.expert_profile.skills = expertSkill;
    }
    user.expert_profile.rate_currency = currencyData;
    return user;
  }
  public async getTimeline(
    group_id: number,
    data: TimelineFiltersDto,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;

      const community = await this.communityGroupRepository.findOne({
        where: {
          id: group_id,
        },
      });

      if (!community) {
        throw new HttpException(
          'COMMUNITY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let timelineFilters: any = { where: { group_id: group_id } };

      if (data.filter === 'my_posts') {
        timelineFilters = timelineFilters.where = {
          ...timelineFilters.where,
          created_by: user_id,
        };
      } else if (data.filter === 'from_hosts') {
        timelineFilters = timelineFilters.where = {
          ...timelineFilters.where,
          // created_by: community.community_created_by,
        };
      } else if (data.filter === 'uncommented') {
        timelineFilters = timelineFilters.where = {
          ...timelineFilters.where,
        };
      } else if (data.filter === 'near_by') {
      }
      const posts = await this.groupTimelineRepository.find({
        where: timelineFilters.where,
        order: {
          id: 'DESC',
        },
        relations: ['likes'],
        take: data.limit,
        skip,
      });

      const timelineResp: any = [];
      const resPost: any = [...posts];
      for (let i = 0; i < resPost.length; i++) {
        const post_hide = await this.postHideRepository.findOne({
          where: {
            group_timeline_post: {
              id: resPost[i].id,
            },
            user_id: user_id,
          },
        });
        if (post_hide) {
          continue;
        }
        if (resPost[i].post_type === 'POST') {
          const post = await this.getPosts(resPost[i].post_id, user_id);
          if (post) {
            post.share_count = await this.communityPostRepository.count({
              where: {
                share_id: post.id,
                post_share_type: POST_SHARE_TYPE.POST,
              },
            });
            post.timeline_post_id = resPost[i].id;
            post.likes = resPost[i].likes.length;
            post.is_liked = this.findObject(resPost[i].likes, user_id, 'bool');
            if (
              post.is_share == TRUE_FALSE.TRUE &&
              post.post_share_type == POST_SHARE_TYPE.EVENT
            ) {
              const eventRes: any = await this.communityEventRepository.findOne(
                {
                  where: {
                    id: post.share_id,
                    status: EVENT_STATUS.ACCEPTED,
                  },
                  relations: [
                    'event_timing',
                    'event_speakers',
                    'event_lecture_timing',
                    'event_lecture_timing.event_speakers',
                    'event_lecture_timing.event_timing',
                  ],
                },
              );

              if (eventRes && eventRes.id) {
                const communityRequest: any =
                  await this.communityRequestRepository.findOne({
                    where: {
                      request_reference_id: eventRes.id,
                      community_request_type: COMMUNITY_REQUEST_TYPE.EVENT,
                    },
                    order: {
                      id: 'DESC',
                    },
                    relations: ['community'],
                  });
                eventRes.community_request = communityRequest
                  ? communityRequest
                  : {};
              }
              if (user_id > 0) {
                if (eventRes && eventRes.id) {
                  const attend = await this.attendEventRepository.findOne({
                    where: {
                      event: {
                        id: eventRes.id,
                      },
                      attendee: user_id,
                    },
                  });
                  post.current_user_attending_status = attend;
                  const count = await this.attendEventRepository.count({
                    where: {
                      event: { id: eventRes.id },
                    },
                  });
                  if (count > 0) {
                    eventRes.is_attending = true;
                  } else {
                    eventRes.is_attending = false;
                  }
                  eventRes.attending_member_counts = count;
                  if (
                    eventRes.community_request &&
                    eventRes.community_request.community &&
                    eventRes.community_request.community.id
                  ) {
                    const community_user =
                      await this.communityUserRepository.findOne({
                        where: {
                          community: {
                            id: eventRes.community_request.community.id,
                          },
                          user_id: user_id,
                        },
                      });
                    if (
                      community_user?.invite_status ===
                      COMMUNITY_INVITE_STATUS.REJECTED
                    ) {
                      eventRes.community_request.community.is_rejected = true;
                    } else {
                      eventRes.community_request.community.is_rejected = false;
                    }

                    if (
                      community_user?.invite_status ===
                      COMMUNITY_INVITE_STATUS.PENDING
                    ) {
                      eventRes.community_request.community.is_requested = true;
                    } else {
                      eventRes.community_request.community.is_requested = false;
                    }
                  }
                }
              }
              if (eventRes) {
                post.share_id = eventRes;
              }
            }
            if (
              post.is_share == TRUE_FALSE.TRUE &&
              post.post_share_type == POST_SHARE_TYPE.MASTER_CLASS
            ) {
              const course = await firstValueFrom(
                this.masterClassClient.send('get_course_by_id', post.share_id),
              );
              post.share_id = course;
            }
            if (
              post.is_share == TRUE_FALSE.TRUE &&
              post.post_share_type == POST_SHARE_TYPE.FREELANCER
            ) {
              const userExpertise = await this.getUserWithProfile(
                post.share_id,
                user_id,
              );

              post.share_id = userExpertise;
            }
            if (
              post.is_share == TRUE_FALSE.TRUE &&
              post.post_share_type == POST_SHARE_TYPE.EXPERTISE
            ) {
              const gig = await firstValueFrom(
                this.productLauncherClient.send(
                  'get_gig_by_id',
                  JSON.stringify({ id: post.share_id, user_id: user_id }),
                ),
              );
              post.share_id = gig;
            }
            if (
              post.is_share == TRUE_FALSE.TRUE &&
              post.post_share_type == POST_SHARE_TYPE.POST
            ) {
              const sharedPost: any =
                await this.communityPostRepository.findOne({
                  where: {
                    id: post.share_id,
                  },
                  relations: [
                    'topics',
                    'group_comments',
                    'topics.follows',
                    'group_comments.group_comment_likes',
                  ],
                });
              if (sharedPost) {
                const timeline = await this.groupTimelineRepository.findOne({
                  where: {
                    post_id: post.share_id,
                  },
                  order: {
                    id: 'DESC',
                  },
                  relations: ['likes'],
                });

                sharedPost.comments_count = sharedPost.group_comments.length
                  ? sharedPost.group_comments.length
                  : 0;
                sharedPost.likes =
                  timeline && timeline.likes.length ? timeline.likes.length : 0;
                sharedPost.is_liked =
                  timeline && timeline.likes.length
                    ? this.findObject(timeline.likes, user_id, 'bool')
                    : false;

                const user = await this.getUserData(
                  Number(sharedPost.created_by),
                );
                sharedPost.created_by = user;
                post.share_id = sharedPost;
              }
            }
            if (data.filter === 'uncommented') {
              if (post.group_comments.length == 0) {
                timelineResp.push(post);
              }
            } else {
              timelineResp.push(post);
            }
          }
        }
        if (resPost[i].post_type === 'POLL') {
          const post = await this.getPolls(
            resPost[i].post_id,
            resPost[i].group_id,
            user_id,
          );
          if (post) {
            post.timeline_post_id = resPost[i].id;
            post.likes = resPost[i].likes.length;
            post.is_liked = this.findObject(resPost[i].likes, user_id, 'bool');
            post.answered_by_user = this.findObject(
              post.answers,
              user_id,
              'obj',
            );
            post.answers;

            timelineResp.push(post);
          }
        }
        if (resPost[i].post_type === 'SHARE_LOCATION') {
          const post = await this.getLocationShare(resPost[i].post_id, user_id);

          if (post) {
            post.timeline_post_id = resPost[i].id;
            post.likes = resPost[i].likes.length;
            post.is_liked = this.findObject(resPost[i].likes, user_id, 'bool');

            timelineResp.push(post);
          }
        }

        if (resPost[i].post_type === 'ARTICLE') {
          const post = await this.getArticles(resPost[i].post_id, user_id);
          if (post) {
            post.timeline_post_id = resPost[i].id;
            post.likes = resPost[i].likes.length;
            post.is_liked = this.findObject(resPost[i].likes, user_id, 'bool');

            timelineResp.push(post);
          }
        }
      }
      const total = await this.groupTimelineRepository.count(timelineFilters);
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: timelineResp,
        community_event: community,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async commentProcess(data: any, user_id: number) {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i].commented_by) {
          data[i].commented_by = await this.getUserData(data[i].commented_by);
        }
        data[i].is_comment_like = false;
        data[i].id_comment_hidden = false;
        data[i].comment_like_count = 0;
        if (data[i].group_comment_likes) {
          for (let j = 0; j < data[i].group_comment_likes.length; j++) {
            const commentLikeCount =
              await this.groupPostCommentLikeRepository.count({
                where: {
                  comments: { id: data[i].id },
                },
              });
            data[i].comment_like_count = commentLikeCount;
            if (data[i].group_comment_likes[j].user_id == user_id) {
              data[i].is_comment_like = true;
              break;
            } else {
              data[i].is_comment_like = false;
            }
          }
        }
        if (data[i].group_comment_hide) {
          for (let j = 0; j < data[i].group_comment_hide.length; j++) {
            if (data[i].group_comment_hide[j].user_id == user_id) {
              data[i].id_comment_hidden = true;
              break;
            } else {
              data[i].id_comment_hidden = false;
            }
          }
        }
      }
    }
    return data;
  }

  public async getPosts(id: number, user_id: number): Promise<any> {
    try {
      const post = await this.communityPostRepository.findOne({
        where: {
          id: id,
          post_status: POST_STATUS.PUBLISHED,
        },
        relations: [
          'topics',
          'group_comments',
          'group_comments.group_comment_likes',
          'group_comments.group_comment_hide',
        ],
      });
      if (post) {
        const postReturn: any = post;

        const user = await this.getUserData(post.created_by);
        postReturn.created_by = user;
        postReturn.post_type = POST_TYPE.POST;
        const postComments: any = await this.commentProcess(
          [...postReturn.group_comments],
          user_id,
        );
        postReturn.group_comments = postComments;

        return postReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getArticles(id: number, user_id: number): Promise<any> {
    try {
      const article = await this.communityArticleRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'topics',
          'group_comments',
          'group_comments.group_comment_likes',
          'group_comments.group_comment_hide',
        ],
      });

      if (article) {
        const articleReturn: any = article;

        const user = await this.getUserData(article.created_by);
        articleReturn.created_by = user;
        articleReturn.post_type = POST_TYPE.ARTICLE;

        const postComments: any = await this.commentProcess(
          [...articleReturn.group_comments],
          user_id,
        );

        articleReturn.group_comments = postComments;

        return articleReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPolls(
    id: number,
    group_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      console.log('RUNNING ID', id);
      const poll = await this.communityPollRepository.findOne({
        where: {
          id: id,
          poll_status: POLL_STATUS.PUBLISHED,
        },
        relations: [
          'options',
          'answers',
          'answers.option',
          'topics',
          'group_comments',
          'group_comments.group_comment_likes',
          'group_comments.group_comment_hide',
        ],
      });

      if (poll) {
        const pollReturn: any = poll;
        const user = await this.getUserData(poll.created_by);

        pollReturn.created_by = user;
        pollReturn.post_type = POST_TYPE.POLL;

        const postComments: any = await this.commentProcess(
          [...pollReturn.group_comments],
          user_id,
        );
        const answerCount = await this.pollAnswerRepository.count({
          where: {
            poll: { id: poll.id },
            user_id: user_id,
          },
        });

        pollReturn.user_answer_count = answerCount;

        pollReturn.no_of_answers = pollReturn.answers.length;
        pollReturn.group_comments = postComments;

        return pollReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getLocationShare(id: number, user_id: number): Promise<any> {
    try {
      const location = await this.communityLocationPostRepository.findOne({
        where: {
          id: id,
        },
        relations: [
          'topics',
          'group_comments',
          'group_comments.group_comment_likes',
          'group_comments.group_comment_hide',
        ],
      });

      if (location) {
        const locationReturn: any = location;

        const user = await this.getUserData(location.created_by);
        locationReturn.created_by = user;
        locationReturn.post_type = POST_TYPE.SHARE_LOCATION;

        const postComments: any = await this.commentProcess(
          [...locationReturn.group_comments],
          user_id,
        );
        locationReturn.group_comments = postComments;

        return locationReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserData(id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send<any>('get_user_by_id', {
        userId: id,
      }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async postReaction(
    id: number,
    data: PostReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.groupTimelineRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'TIMELINE_POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.groupPostLikeRepository.findOne({
        where: {
          post_id: timelinePost.id,
          user_id: user_id,
        },
      });

      const group = await firstValueFrom(
        this.communityClient.send<any>(
          'get_group_by_id',
          Number(timelinePost.group_id),
        ),
      );
      let post;
      if (timelinePost.post_type == POST_TYPE.POST) {
        post = await this.communityPostRepository.findOne({
          where: {
            id: timelinePost.post_id,
          },
        });
      }

      if (timelinePost.post_type == POST_TYPE.POLL) {
        post = await this.communityPollRepository.findOne({
          where: {
            id: timelinePost.post_id,
          },
        });
      }

      if (timelinePost.post_type == POST_TYPE.ARTICLE) {
        post = await this.communityArticleRepository.findOne({
          where: {
            id: timelinePost.post_id,
          },
        });
      }

      if (timelinePost.post_type == POST_TYPE.SHARE_LOCATION) {
        post = await this.communityLocationPostRepository.findOne({
          where: {
            id: timelinePost.post_id,
          },
        });
      }

      if (!post) {
        return {
          status: 500,
          message: 'No Post Found',
        };
      }

      if (data.reaction_type === REACTION_TYPE.LIKE && !getReaction) {
        const reaction = new GroupPostLike();
        reaction.group_id = timelinePost.group_id;
        reaction.post_id = timelinePost.post_id;
        reaction.post_type = timelinePost.post_type;
        reaction.group_timeline_post = timelinePost;
        reaction.user_id = user_id;
        reaction.reaction = data.reaction_type;

        await this.groupPostLikeRepository.save(reaction);
        const invitedUser = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(user_id),
          }),
        );

        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'GROUP_POST_LIKE',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*group name*', group.group_name),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*group name*', group.group_name),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: post.created_by ? post.created_by : 0,
          payload: reaction,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
      }
      if (data.reaction_type === REACTION_TYPE.DISLIKE && getReaction) {
        await this.groupPostLikeRepository.delete(getReaction.id);
      }

      return {
        message: `${data.reaction_type} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
