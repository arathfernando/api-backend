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
  COMMUNITY_REQUEST_TYPE,
  EVENT_STATUS,
  POST_SHARE_TYPE,
  POST_TYPE,
  REACTION_TYPE,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import { PostReactionDto } from 'src/core/dtos/post/post-reaction.dto';
import { TimelineFiltersDto } from 'src/core/dtos/timeline-filters.dto';
import {
  Community,
  CommunityArticle,
  CommunityEvent,
  CommunityLocationPost,
  CommunityPoll,
  CommunityPollAnswers,
  CommunityPost,
  CommunityTimeline,
  CommunityTopic,
  CommunityUser,
  EventAttendees,
  PostHide,
  PostLike,
} from 'src/database/entities';
import { CommunityRequest } from 'src/database/entities/community-request.entity';
import { PostCommentLike } from 'src/database/entities/post-comment-like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TimelineService {
  constructor(
    @Inject('MASTER_CLASS') private readonly masterClassClient: ClientProxy,
    @Inject('PRODUCT_LAUNCHER_SERVICE')
    private readonly productLauncherClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityEvent)
    private readonly communityEventRepository: Repository<CommunityEvent>,
    @InjectRepository(CommunityUser)
    private readonly communityUserRepository: Repository<CommunityUser>,
    @InjectRepository(EventAttendees)
    private readonly attendEventRepository: Repository<EventAttendees>,
    @InjectRepository(CommunityPost)
    private readonly communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityPoll)
    private readonly communityPollRepository: Repository<CommunityPoll>,
    @InjectRepository(CommunityArticle)
    private readonly communityArticleRepository: Repository<CommunityArticle>,
    @InjectRepository(CommunityLocationPost)
    private readonly communityLocationPostRepository: Repository<CommunityLocationPost>,
    @InjectRepository(CommunityTimeline)
    private readonly timelineRepository: Repository<CommunityTimeline>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(CommunityRequest)
    private readonly communityRequestRepository: Repository<CommunityRequest>,
    @InjectRepository(PostCommentLike)
    private readonly postCommentLikeRepository: Repository<PostCommentLike>,
    @InjectRepository(CommunityPollAnswers)
    private readonly pollAnswerRepository: Repository<CommunityPollAnswers>,
    @InjectRepository(PostHide)
    private readonly postHideRepository: Repository<PostHide>,
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

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async getUserWithProfile(
    user_id: number,
    current_user: number,
  ): Promise<any> {
    let allRating = 0;
    const user = await firstValueFrom(
      this.userClient.send('get_user_with_profile', { userId: user_id }),
    );
    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;
    if (user.expert_profile) {
      if (user.expert_profile.rate_currency != null) {
        const currencyData = await firstValueFrom(
          this.adminClient.send<any>(
            'get_currency_by_id',
            user.expert_profile.rate_currency,
          ),
        );
        user.expert_profile.rate_currency = currencyData;
      }
      const reviews = await this.communityRequestRepository.query(
        `SELECT * FROM user_expertise_review WHERE expertise_user_id = ${user.id}`,
      );

      user.expert_profile.reviews = reviews;
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
        const review_Count = reviewCount;
        for (let i = 0; i < user.expert_profile.reviews.length; i++) {
          allRating =
            allRating +
            parseInt(user.expert_profile.reviews[i].over_all_rating);
        }

        const reviewCounts = parseInt(review_Count[0].count);
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
        user.expert_profile.review_count = allRating / reviewCounts;
        user.expert_profile.reviewer_count = reviewer.length;
        user.expert_profile.skills = expertSkill;
      }
    }

    return user;
  }

  public async getTimeline(
    community_id: number,
    data: TimelineFiltersDto,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;

      const community = await this.communityRepository.findOne({
        where: {
          id: community_id,
        },
      });

      if (!community) {
        throw new HttpException(
          'COMMUNITY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let timelineFilters: any = { community_id: community_id };

      if (data.filter === 'my_posts') {
        timelineFilters = {
          ...timelineFilters,
          created_by: user_id,
        };
      } else if (data.filter === 'from_hosts') {
        timelineFilters = {
          ...timelineFilters,
          created_by: community.community_created_by,
        };
      } else if (data.filter === 'uncommented') {
        timelineFilters = {
          ...timelineFilters,
        };
      } else if (data.filter === 'near_by') {
        timelineFilters = {
          ...timelineFilters,
        };
      }

      const timeline: any = await this.timelineRepository.find({
        where: timelineFilters,
        order: {
          id: 'DESC',
        },
        relations: ['likes', 'comments', 'post_pin'],
        take: data.limit,
        skip,
      });

      const timelineResp: any = [];
      if (data.filter === 'uncommented') {
        for (let i = 0; i < timeline.length; i++) {
          if (timeline[i].comments.length) {
            timeline.splice(i, 1);
          }
        }
      }
      for (let i = 0; i < timeline.length; i++) {
        const post_hide = await this.postHideRepository.findOne({
          where: {
            timeline_post: {
              id: timeline[i].id,
            },
            user_id: user_id,
          },
        });

        if (post_hide) {
          continue;
        }
        if (timeline[i].post_type === 'POST') {
          const post = await this.getPosts(
            timeline[i].post_id,
            timeline[i].community_id,
            user_id,
          );

          if (post) {
            if (timeline[i].post_pin) {
              post.post_pin = timeline[i].post_pin;
            }
            post.share_count = await this.communityPostRepository.count({
              where: {
                share_id: post.id,
                post_share_type: POST_SHARE_TYPE.POST,
              },
            });

            post.timeline_post_id = timeline[i].id;
            post.likes = timeline[i].likes.length;
            post.is_liked = this.findObject(timeline[i].likes, user_id, 'bool');
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
                if (eventRes) {
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
                      event: {
                        id: eventRes.id,
                      },
                    },
                  });

                  eventRes.attending_member_counts = count ? count : 0;
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
                    'comments',
                    'topics.follows',
                    'comments.comment_likes',
                  ],
                });

              if (sharedPost) {
                const timeline = await this.timelineRepository.findOne({
                  where: {
                    post_id: post.share_id,
                  },
                  order: {
                    id: 'DESC',
                  },
                  relations: ['likes'],
                });

                sharedPost.comments_count = sharedPost.comments.length;
                sharedPost.likes =
                  timeline && timeline.likes.length ? timeline.likes.length : 0;
                sharedPost.is_liked =
                  timeline && timeline.likes.length
                    ? this.findObject(timeline.likes, user_id, 'bool')
                    : false;

                const user = await this.getUser(Number(sharedPost.created_by));
                sharedPost.created_by = user;
                post.share_id = sharedPost;
              }
            }

            timelineResp.push(post);
          }
        }

        if (timeline[i].post_type === 'POLL') {
          const post = await this.getPolls(
            timeline[i].post_id,
            timeline[i].community_id,
            user_id,
          );

          if (post) {
            post.timeline_post_id = timeline[i].id;
            post.likes = timeline[i].likes.length;
            post.is_liked = this.findObject(timeline[i].likes, user_id, 'bool');
            post.answered_by_user = this.findObject(
              post.answers,
              user_id,
              'obj',
            );
            timelineResp.push(post);
          }
        }

        if (timeline[i].post_type === 'SHARE_LOCATION') {
          const post = await this.getLocationShare(
            timeline[i].post_id,
            timeline[i].community_id,
            user_id,
          );

          if (post) {
            post.timeline_post_id = timeline[i].id;
            post.likes = timeline[i].likes.length;
            post.is_liked = this.findObject(timeline[i].likes, user_id, 'bool');

            timelineResp.push(post);
          }
        }

        if (timeline[i].post_type === 'ARTICLE') {
          const post = await this.getArticles(
            timeline[i].post_id,
            timeline[i].community_id,
            user_id,
          );

          if (post) {
            post.timeline_post_id = timeline[i].id;
            post.likes = timeline[i].likes.length;
            post.is_liked = this.findObject(timeline[i].likes, user_id, 'bool');

            timelineResp.push(post);
          }
        }
      }

      const total = await this.timelineRepository.count({
        where: timelineFilters,
      });

      const totalPages = Math.ceil(total / data.limit);
      return {
        data: timelineResp,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPosts(
    id: number,
    community_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const post = await this.communityPostRepository.findOne({
        where: {
          id: id,
          community: {
            id: community_id,
          },
        },
        relations: [
          'topics',
          'comments',
          'topics.follows',
          'comments.comment_likes',
          'comments.comment_hide',
        ],
      });

      if (post) {
        const postReturn: any = post;
        const user = await this.getUser(post.created_by);
        postReturn.created_by = user;
        postReturn.post_type = POST_TYPE.POST;
        const postTopics: any = [...postReturn.topics];
        const postComments: any = await this.commentProcess(
          [...postReturn.comments],
          user_id,
        );
        postReturn.comments = postComments;
        postReturn.comments_count = postComments.length;
        postReturn.topics = postTopics;

        return postReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async commentProcess(data: any, user_id: number) {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i].commented_by) {
          data[i].commented_by = await this.getUser(data[i].commented_by);
        }
        data[i].is_comment_like = false;
        data[i].is_comment_hidden = false;
        data[i].comment_like_count = 0;
        if (data[i].comment_likes) {
          for (let j = 0; j < data[i].comment_likes.length; j++) {
            const commentLikeCount = await this.postCommentLikeRepository.count(
              {
                where: {
                  comments: { id: data[i].id },
                },
              },
            );
            data[i].comment_like_count = commentLikeCount;
            if (
              data[i].comment_likes[j] &&
              data[i].comment_likes[j].user_id == user_id
            ) {
              data[i].is_comment_like = true;
              break;
            } else {
              data[i].is_comment_like = false;
            }
          }
        }
        if (data[i].comment_hide) {
          for (let j = 0; j < data[i].comment_hide.length; j++) {
            if (data[i].comment_hide[j].user_id == user_id) {
              data[i].is_comment_hidden = true;
              break;
            } else {
              data[i].is_comment_hidden = false;
            }
          }
        }
      }
    }
    return data;
  }

  public async getArticles(
    id: number,
    community_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const article = await this.communityArticleRepository.findOne({
        where: {
          id: id,
          community: {
            id: community_id,
          },
        },
        relations: [
          'topics',
          'comments',
          'comments.comment_likes',
          'comments.comment_hide',
        ],
      });

      if (article) {
        const articleReturn: any = article;

        const user = await this.getUser(article.created_by);
        articleReturn.created_by = user;
        articleReturn.post_type = POST_TYPE.ARTICLE;

        const postComments: any = await this.commentProcess(
          [...articleReturn.comments],
          user_id,
        );

        articleReturn.comments = postComments;

        return articleReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPolls(
    id: number,
    community_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const poll = await this.communityPollRepository.findOne({
        where: {
          id: id,
          community: {
            id: community_id,
          },
        },
        relations: [
          'options',
          'answers',
          'answers.option',
          'topics',
          'comments',
          'comments.comment_likes',
          'comments.comment_hide',
        ],
      });

      if (poll) {
        const pollReturn: any = poll;
        const user = await this.getUser(poll.created_by);

        pollReturn.created_by = user;
        pollReturn.post_type = POST_TYPE.POLL;

        const postComments: any = await this.commentProcess(
          [...pollReturn.comments],
          user_id,
        );
        const answerCount = await this.pollAnswerRepository.count({
          where: {
            poll: {
              id: poll.id,
            },
            user_id: user_id,
          },
        });

        pollReturn.user_answer_count = answerCount;
        pollReturn.no_of_answers = pollReturn.answers.length;
        pollReturn.comments = postComments;

        return pollReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getLocationShare(
    id: number,
    community_id: number,
    user_id: number,
  ): Promise<any> {
    try {
      const location = await this.communityLocationPostRepository.findOne({
        where: {
          id: id,
          community: {
            id: community_id,
          },
        },
        relations: ['topics', 'comments'],
      });

      if (location) {
        const locationReturn: any = location;

        const user = await this.getUser(location.created_by);
        locationReturn.created_by = user;
        locationReturn.post_type = POST_TYPE.SHARE_LOCATION;

        const postComments: any = await this.commentProcess(
          [...locationReturn.comments],
          user_id,
        );
        locationReturn.comments = postComments;

        return locationReturn;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async postReaction(
    id: number,
    data: PostReactionDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.timelineRepository.findOne({
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

      const getReaction = await this.postLikeRepository.findOne({
        where: {
          timeline_post: {
            id: timelinePost.id,
          },
          user_id: user_id,
        },
      });

      const community = await firstValueFrom(
        this.communityClient.send<any>(
          'get_community',
          Number(timelinePost.community_id),
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
        const reaction = new PostLike();
        reaction.community_id = timelinePost.community_id;
        reaction.post_type = timelinePost.post_type;
        reaction.timeline_post = timelinePost;
        reaction.user_id = user_id;
        reaction.reaction = data.reaction_type;

        await this.postLikeRepository.save(reaction);
        const invitedUser = await firstValueFrom(
          this.userClient.send<any>('get_user_by_id', {
            userId: Number(user_id),
          }),
        );

        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'COMMUNITY_POST_LIKE',
          ),
        );

        const joinRequestNotification = {
          title: admin_notification.notification_title
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*community name*', community.name),
          content: admin_notification.notification_content
            .replace('*user*', invitedUser.general_profile.first_name)
            .replace('*community name*', community.name),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: post.created_by,
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
        await this.postLikeRepository.delete(getReaction.id);
      }

      return {
        message: `${data.reaction_type} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async arrayColumn(array, column) {
    return array.map((item) => item[column]);
  }

  public async getTimelineByTopicId(
    id: number,
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const skip = data.limit * data.page - data.limit;
      const communityTopic: any = await this.communityTopicRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!communityTopic) {
        return {
          status: 500,
          message: 'No topic Found',
        };
      }
      const community = await this.communityRequestRepository.findOne({
        where: {
          // community_request_status: COMMUNITY_REQUEST_STATUS.ACCEPTED,
          community_request_type: COMMUNITY_REQUEST_TYPE.TOPIC,
          request_reference_id: id,
        },
        relations: ['community'],
      });
      if (!community || !community.community) {
        return {
          status: 500,
          message: 'No Community Found For This Topic.',
        };
      }
      communityTopic.community = community.community;
      let timelineFilters: any = { community_id: communityTopic.community.id };

      if (data.filter === 'my_posts') {
        timelineFilters = {
          ...timelineFilters,
          created_by: user_id,
        };
      } else if (data.filter === 'from_hosts') {
        timelineFilters = {
          ...timelineFilters,
        };
      } else if (data.filter === 'uncommented') {
      } else if (data.filter === 'near_by') {
      }

      const timeline = await this.timelineRepository.find({
        where: timelineFilters,
        order: {
          id: 'DESC',
        },
        relations: ['likes', 'post_pin'],
        take: data.limit,
        skip,
      });

      if (!timeline.length) {
        return {
          status: 500,
          message: `No Timeline For This Topic's community.`,
        };
      }
      const timelineResp: any = [];
      const resPost: any = [...timeline];
      for (let i = 0; i < resPost.length; i++) {
        const post_hide = await this.postHideRepository.findOne({
          where: {
            timeline_post: {
              id: timeline[i].id,
            },
            user_id: user_id,
          },
        });
        if (post_hide) {
          continue;
        }
        if (resPost[i].post_type === 'POST') {
          const post = await this.getPosts(
            resPost[i].post_id,
            resPost[i].community_id,
            user_id,
          );
          if (post) {
            if (timeline[i].post_pin) {
              post.post_pin = timeline[i].post_pin;
            }
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
                  await this.communityRequestRepository.find({
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
                if (eventRes) {
                  const attend = await this.attendEventRepository.findOne({
                    where: {
                      event: { id: eventRes.id },
                      attendee: user_id,
                    },
                  });

                  post.current_user_attending_status = attend ? attend : {};
                  if (eventRes.community) {
                    post.current_user_community_status =
                      await this.communityUserRepository.findOne({
                        where: {
                          community: { id: eventRes.community.id },
                          user_id: user_id,
                        },
                      });
                  }
                  const count = await this.attendEventRepository.count({
                    where: {
                      event: { id: eventRes.id },
                    },
                  });
                  eventRes.attending_member_counts = count ? count : 0;
                }
              }
              const post_count = await this.communityPostRepository.count({
                where: {
                  is_share: TRUE_FALSE.TRUE,
                  share_id: post.share_id,
                  post_share_type: POST_SHARE_TYPE.EVENT,
                },
              });
              post.post_count = post_count;
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
                    'comments',
                    'topics.follows',
                    'comments.comment_likes',
                  ],
                });

              if (sharedPost) {
                const timeline = await this.timelineRepository.findOne({
                  where: {
                    post_id: post.share_id,
                  },
                  order: {
                    id: 'DESC',
                  },
                  relations: ['likes'],
                });

                sharedPost.comments_count = sharedPost.comments.length;
                sharedPost.likes =
                  timeline && timeline.likes.length ? timeline.likes.length : 0;
                sharedPost.is_liked =
                  timeline && timeline.likes.length
                    ? this.findObject(timeline.likes, user_id, 'bool')
                    : false;

                const user = await this.getUser(Number(sharedPost.created_by));
                sharedPost.created_by = user;
                post.share_id = sharedPost;
              }
            }
            timelineResp.push(post);
          }
        }
        if (resPost[i].post_type === 'POLL') {
          const post = await this.getPolls(
            resPost[i].post_id,
            resPost[i].community_id,
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
          const post = await this.getLocationShare(
            resPost[i].post_id,
            resPost[i].community_id,
            user_id,
          );

          if (post) {
            post.timeline_post_id = resPost[i].id;
            post.likes = resPost[i].likes.length;
            post.is_liked = this.findObject(resPost[i].likes, user_id, 'bool');

            timelineResp.push(post);
          }
        }

        if (resPost[i].post_type === 'ARTICLE') {
          const post = await this.getArticles(
            resPost[i].post_id,
            resPost[i].community_id,
            user_id,
          );

          if (post) {
            post.timeline_post_id = resPost[i].id;
            post.likes = resPost[i].likes.length;
            post.is_liked = this.findObject(resPost[i].likes, user_id, 'bool');

            timelineResp.push(post);
          }
        }
      }
      const total = await this.timelineRepository.count({
        where: timelineFilters,
      });
      const totalPages = Math.ceil(total / data.limit);
      return {
        data: timelineResp,
        page: data.page,
        limit: data.limit,
        total_pages: totalPages,
        count: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
