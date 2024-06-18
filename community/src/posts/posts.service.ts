import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  COMMUNITY_REQUEST_TYPE,
  EVENT_STATUS,
  HIDE_UNHIDE,
  POST_LOCATION,
  POST_SHARE_TYPE,
  POST_STATUS,
  POST_TYPE,
  REACTION_TYPE,
  TRUE_FALSE,
} from 'src/core/constant/enum.constant';
import { CreateCommentDto } from 'src/core/dtos/post/create-comment.dto';
import { CreatePostDto } from 'src/core/dtos/post/create-post.dto';
import { ReportPostDto } from 'src/core/dtos/post/report-post.dto';
import { SharePostDto } from 'src/core/dtos/post/share-post.dto';
import { UpdateCommentDto } from 'src/core/dtos/post/update-comment.dto';
import { S3Service } from 'src/core/services/s3/s3.service';
import {
  Community,
  CommunityArticle,
  CommunityEvent,
  CommunityGroup,
  CommunityGroupTimeline,
  CommunityLocationPost,
  CommunityPoll,
  CommunityTimeline,
  CommunityTopic,
  EventAttendees,
  GroupActivity,
  GroupPostCommentHide,
  GroupPostHide,
  PostCommentReport,
  PostHide,
  PostPin,
} from 'src/database/entities';
import { Comments } from 'src/database/entities/comments.entity';
import { GroupPostComments } from 'src/database/entities/group-comments.entity';
import { CommunityPost } from 'src/database/entities/posts.entity';
import { PostReport } from 'src/database/entities/posts-report.entity';
import { SharedPosts } from 'src/database/entities/share-post.entity';
import { In, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { PostFilterDto } from 'src/core/dtos/post/post-filter.dto';
import { PostCommentLikeDto } from 'src/core/dtos/post/post-comment-like.dto';
import { PostCommentLike } from 'src/database/entities/post-comment-like.entity';
import { GroupPostCommentLike } from 'src/database/entities/post-group-comment-like.entity';
import { IMailPayload } from 'src/core/interfaces';
import { ConfigService } from '@nestjs/config';
import { ReportPostCommentDto } from 'src/core/dtos/post/report-post-comment.dto';
import { PostCommentHideDto } from 'src/core/dtos/post/post-comment-hide.dto';
import { PostCommentHide } from 'src/database/entities/post-comment-hide.entity';
import { PostHideDto } from 'src/core/dtos/post/post-hide.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityRequest } from 'src/database/entities/community-request.entity';

@Injectable()
export class PostsService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('COMMUNITY_SERVICE') private readonly communityClient: ClientProxy,
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientProxy,
    @Inject('MASTER_CLASS') private readonly masterClassClient: ClientProxy,
    @Inject('PRODUCT_LAUNCHER_SERVICE')
    private readonly productLauncherClient: ClientProxy,
    private readonly s3Service: S3Service,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityGroup)
    private readonly communityGroupRepository: Repository<CommunityGroup>,
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(CommunityPost)
    private readonly communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityPoll)
    private readonly communityPollRepository: Repository<CommunityPoll>,
    @InjectRepository(CommunityArticle)
    private readonly communityArticleRepository: Repository<CommunityArticle>,
    @InjectRepository(CommunityLocationPost)
    private readonly communityLocationPostRepository: Repository<CommunityLocationPost>,
    @InjectRepository(PostReport)
    private readonly postReportRepository: Repository<PostReport>,
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>,
    @InjectRepository(CommunityTimeline)
    private readonly timelineRepository: Repository<CommunityTimeline>,
    @InjectRepository(CommunityGroupTimeline)
    private readonly groupTimelineRepository: Repository<CommunityGroupTimeline>,
    @InjectRepository(GroupPostComments)
    private readonly groupCommentRepository: Repository<GroupPostComments>,
    @InjectRepository(GroupActivity)
    private readonly groupActivityRepository: Repository<GroupActivity>,
    @InjectRepository(PostCommentLike)
    private readonly postCommentLikeRepository: Repository<PostCommentLike>,
    @InjectRepository(GroupPostCommentLike)
    private readonly groupPostCommentLikeRepository: Repository<GroupPostCommentLike>,
    @InjectRepository(PostPin)
    private readonly postPinRepository: Repository<PostPin>,
    @InjectRepository(PostCommentReport)
    private readonly postCommentReportRepository: Repository<PostCommentReport>,
    @InjectRepository(PostCommentHide)
    private readonly postCommentHideRepository: Repository<PostCommentHide>,
    @InjectRepository(GroupPostCommentHide)
    private readonly groupPostCommentHideRepository: Repository<GroupPostCommentHide>,
    @InjectRepository(GroupPostHide)
    private readonly groupPostHideRepository: Repository<GroupPostHide>,
    @InjectRepository(PostHide)
    private readonly postHideRepository: Repository<PostHide>,
    @InjectRepository(CommunityEvent)
    private readonly communityEventRepository: Repository<CommunityEvent>,
    @InjectRepository(CommunityRequest)
    private readonly communityRequestRepository: Repository<CommunityRequest>,
    @InjectRepository(EventAttendees)
    private readonly attendEventRepository: Repository<EventAttendees>,

    private readonly configService: ConfigService,
  ) {}

  public async getUser(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_by_id', { userId: user_id }),
    );

    delete user.password;
    delete user.verification_code;
    delete user.reset_password_otp;

    return user;
  }

  public async getUserSetting(user_id: number): Promise<any> {
    const user = await firstValueFrom(
      this.userClient.send('get_user_setting_by_id', user_id),
    );
    return user;
  }

  public async createPost(
    files: Express.Multer.File[],
    data: CreatePostDto,
    user_id: number,
  ): Promise<any> {
    try {
      let community = null;
      let group = null;
      if (data.post_location === POST_LOCATION.COMMUNITY) {
        community = await this.communityRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!community) {
          return {
            status: 500,
            message: 'Community Not Found',
          };
        }
      }

      if (data.post_location === POST_LOCATION.GROUP) {
        group = await this.communityGroupRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (!group) {
          return {
            status: 500,
            message: 'Group Not Found',
          };
        }
      }

      let topics = null;
      if (data.topics && data.topics != '') {
        const topicIds = data.topics.split(',');

        topics = await this.communityTopicRepository.find({
          where: {
            id: In(topicIds),
          },
        });
      }

      const post = new CommunityPost();
      const fileUrls = [];
      if (files && files != null) {
        await Promise.all(
          files.map(async (file) => {
            const f = await this.s3Service.uploadFile(file);
            fileUrls.push(f.Location);
          }),
        );
        post.attachments = fileUrls;
      } else if (data.attachments) {
        post.attachments = data.attachments;
      }

      post.content = data.content;
      post.created_by = user_id;
      post.community = community ? community : null;
      post.group = group ? group : null;
      post.topics = topics;
      post.post_location = data.post_location;
      post.post_status = POST_STATUS.PUBLISHED;
      post.is_share = data.is_share;
      post.share_id = data.share_id ? data.share_id : null;
      post.post_share_type = data.post_share_type ? data.post_share_type : null;

      const postCreated = await this.communityPostRepository.save(post);

      if (data.post_location === POST_LOCATION.COMMUNITY) {
        const timeline = new CommunityTimeline();
        timeline.community_id = community.id;
        timeline.created_by = user_id;
        timeline.post_id = postCreated.id;
        timeline.post_type = POST_TYPE.POST;

        await this.timelineRepository.save(timeline);
      }

      if (data.post_location === POST_LOCATION.GROUP) {
        const timeline = new CommunityGroupTimeline();
        timeline.group_id = group.id;
        timeline.created_by = user_id;
        timeline.post_id = postCreated.id;
        timeline.post_type = POST_TYPE.POST;

        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_id', {
            userId: user_id,
          }),
        );
        const groupActivity = new GroupActivity();
        groupActivity.group = group;
        groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} Create a Post in Group ${group.group_name}`;
        await this.groupActivityRepository.save(groupActivity);
        await this.groupTimelineRepository.save(timeline);
      }
      const invitedUser = await firstValueFrom(
        this.userClient.send<any>('get_user_by_id', {
          userId: Number(user_id),
        }),
      );

      if (data.post_location === POST_LOCATION.COMMUNITY) {
        const user = await this.getUser(user_id);
        user_id = user.id;
        const userSetting = await this.getUserSetting(user_id);

        let sentNotification = false;
        const sentNotificationsSet = new Set();

        if (userSetting.length) {
          for (let i = 0; i < userSetting.length; i++) {
            const userSettingKey = userSetting[i].setting.key;
            const userSettingStatus = userSetting[i].setting.status;
            const userSettingValue = userSetting[i].value;
            if (
              userSettingKey === 'community_new_post_notification' &&
              userSettingStatus === 'ACTIVE' &&
              userSettingValue === 'true'
            ) {
              const notificationKey = `${user_id}_${community.community_created_by}`;

              if (!sentNotificationsSet.has(notificationKey)) {
                sentNotificationsSet.add(notificationKey);
                sentNotification = true;

                const admin_notification = await firstValueFrom(
                  this.adminClient.send<any>(
                    'get_notification_by_type',
                    'COMMUNITY_POST',
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
                  notification_to: community.community_created_by,
                  payload: post,
                };

                await firstValueFrom(
                  this.notificationClient.send<any>(
                    'create_notification',
                    JSON.stringify(joinRequestNotification),
                  ),
                );
              }
            }
          }
        }

        if (data.is_share === TRUE_FALSE.TRUE) {
          const admin_notification = await firstValueFrom(
            this.adminClient.send<any>(
              'get_notification_by_type',
              'COMMUNITY_POST_SHARE',
            ),
          );
          const joinRequestNotification = {
            title: admin_notification.notification_title
              .replace('*user*', user.general_profile.first_name)
              .replace('*community name*', community.name),
            content: admin_notification.notification_content
              .replace('*user*', user.general_profile.first_name)
              .replace('*community name*', community.name),
            type: admin_notification.notification_type,
            notification_from: user_id,
            notification_to: post.created_by,
            payload: post,
          };

          await firstValueFrom(
            this.notificationClient.send<any>(
              'create_notification',
              JSON.stringify(joinRequestNotification),
            ),
          );
        }
      }
      if (data.post_location === POST_LOCATION.GROUP) {
        const admin_notification = await firstValueFrom(
          this.adminClient.send<any>(
            'get_notification_by_type',
            'GROUP_POST_HAVE_NEW_POST',
          ),
        );
        const joinRequestNotification = {
          title: admin_notification.notification_title.replace(
            '*group name*',
            group.group_name,
          ),
          content: admin_notification.notification_content.replace(
            '*group name*',
            group.group_name,
          ),
          type: admin_notification.notification_type,
          notification_from: user_id,
          notification_to: group.created_by,
          payload: post,
        };

        await firstValueFrom(
          this.notificationClient.send<any>(
            'create_notification',
            JSON.stringify(joinRequestNotification),
          ),
        );
        if (data.is_share === TRUE_FALSE.TRUE) {
          const admin_notification = await firstValueFrom(
            this.adminClient.send<any>(
              'get_notification_by_type',
              'GROUP_POST_SHARE',
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
            notification_to: group.created_by,
            payload: post,
          };

          await firstValueFrom(
            this.notificationClient.send<any>(
              'create_notification',
              JSON.stringify(joinRequestNotification),
            ),
          );
        }
      }

      return postCreated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updatePost(
    id: number,
    files: Express.Multer.File[],
    data: any,
    user_id: number,
  ): Promise<any> {
    try {
      const where =
        user_id == null ? { id: id } : { id: id, created_by: user_id };

      const post = await this.communityPostRepository.findOne({
        where: { ...where },
      });

      if (!post) {
        return {
          status: 500,
          message: 'Post Not Found',
        };
      }

      const fileUrls = [];
      if (files && files != null) {
        await Promise.all(
          files.map(async (file) => {
            const f = await this.s3Service.uploadFile(file);
            fileUrls.push(f.Location);
          }),
        );
        post.attachments = fileUrls;
      } else if (data.attachments) {
        post.attachments = data.attachments;
      }

      if (data.topics && data.topics != '') {
        const topicIds = data.topics.split(',');

        const topics = await this.communityTopicRepository.find({
          where: {
            id: In(topicIds),
          },
        });
        post.topics = topics;
      }
      if (data.content) {
        post.content = data.content;
      }
      if (data.post_status) {
        post.post_status = data.post_status;
      }
      if (data.remove_feedback) {
        post.remove_feedback = data.remove_feedback;
      }
      if (data.reason_of_rejection) {
        post.reason_of_rejection = data.reason_of_rejection;
      }

      await this.communityPostRepository.save(post);
      return {
        message: 'Post updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPostById(id: number): Promise<any> {
    try {
      const post: any = await this.communityPostRepository.findOne({
        where: {
          id: id,
        },
        relations: ['topics', 'comments', 'group_comments'],
      });

      return post;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPostByCommunity(
    id: number,
    status: PostFilterDto,
  ): Promise<any> {
    try {
      let where;
      if (status.post_status && id) {
        where = {
          community: {
            id: id,
          },
          post_status: status.post_status,
          post_location: POST_LOCATION.COMMUNITY,
        };
      } else if (status.post_status) {
        where = {
          post_location: POST_LOCATION.COMMUNITY,
          post_status: status.post_status,
        };
      } else if (id) {
        where = {
          community: {
            id: id,
          },
          post_location: POST_LOCATION.COMMUNITY,
        };
      } else {
        where = {
          post_location: POST_LOCATION.COMMUNITY,
        };
      }

      const post: any = await this.communityPostRepository.find({
        where,
        relations: ['topics', 'comments', 'community'],
      });
      for (let i = 0; i < post.length; i++) {
        const user = await this.getUser(Number(post[i].created_by));
        post[i].created_by = user;
      }
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPostByCommunityAdmin(id: number, data: any): Promise<any> {
    try {
      let whereConn: any = `{}`;
      if (data.post_location != 'ALL') {
        whereConn = `{"post_location":"${data.post_location}"}`;
      }
      if (id && data.post_location != 'ALL') {
        whereConn = `{"${data.post_location.toLowerCase()}":{"id":${id}},"post_location":"${
          data.post_location
        }"}`;
      }
      whereConn = JSON.parse(whereConn);
      if (data.post_status) {
        whereConn.post_status = data.post_status;
      }
      const post: any = await this.communityPostRepository.find({
        where: whereConn,
        relations: ['topics', 'comments', 'community', 'group'],
      });
      for (let i = 0; i < post.length; i++) {
        const user = await this.getUser(Number(post[i].created_by));
        post[i].created_by = user;
      }
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getPostByGroup(id: number): Promise<any> {
    try {
      return await this.communityPostRepository.find({
        where: {
          group: {
            id: id,
          },
          post_location: POST_LOCATION.GROUP,
        },
        relations: ['topics', 'group_comments'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deletePost(id: number, user_id: number): Promise<any> {
    try {
      const post = await this.communityPostRepository.findOne({
        where: {
          id: id,
        },
      });
      const timeline = await this.timelineRepository.findOne({
        where: {
          post_id: id,
        },
      });

      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (timeline) {
        await this.timelineRepository.delete(timeline.id);
      }
      await this.communityPostRepository.update(id, {
        post_status: POST_STATUS.REMOVE,
      });

      if (user_id != 0) {
        const invitedUser = await firstValueFrom(
          this.userClient.send('get_user_by_id', {
            userId: user_id,
          }),
        );
        const groupActivity = new GroupActivity();
        groupActivity.activity = `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name} Delete a Post in Group`;
        await this.groupActivityRepository.save(groupActivity);
      } else {
        const groupActivity = new GroupActivity();
        groupActivity.activity = `Hubber Team Delete a Post in Group`;
        await this.groupActivityRepository.save(groupActivity);
      }

      return {
        message: 'Post deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      if (data.post_type === 'POST') {
        return await this.postComment(id, data, user_id);
      }

      if (data.post_type === 'POLL') {
        return await this.pollComment(id, data, user_id);
      }

      if (data.post_type === 'ARTICLE') {
        return await this.articleComment(id, data, user_id);
      }

      if (data.post_type === 'SHARE_LOCATION') {
        return await this.locationComment(id, data, user_id);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async postCommentLike(
    id: number,
    data: PostCommentLikeDto,
    user_id: number,
  ): Promise<any> {
    try {
      const comment = await this.commentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.postCommentLikeRepository.findOne({
        where: {
          comments: {
            id: comment.id,
          },
          user_id: user_id,
        },
      });

      if (data.reaction_type === REACTION_TYPE.LIKE && !getReaction) {
        const reaction = new PostCommentLike();
        reaction.comments = comment;
        reaction.user_id = user_id;
        reaction.reaction = data.reaction_type;

        await this.postCommentLikeRepository.save(reaction);
      }
      if (data.reaction_type === REACTION_TYPE.DISLIKE && getReaction) {
        await this.postCommentLikeRepository.delete(getReaction.id);
      }

      return {
        message: `${data.reaction_type} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateComment(
    id: number,
    data: UpdateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const comment = await this.commentRepository.findOne({
        where: {
          id: id,
          commented_by: user_id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.commentRepository.update(id, data);

      return {
        message: 'Comment updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async postComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.timelineRepository.findOne({
        where: {
          post_id: id,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const community = await firstValueFrom(
        this.communityClient.send<any>(
          'get_community',
          Number(timelinePost.community_id),
        ),
      );

      const post = await this.communityPostRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const comment = new Comments();
      comment.comment = data.comment;
      comment.timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.commentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.post = post;
      comment.commented_by = user_id;

      const commented = await this.commentRepository.save(comment);

      const user = await this.getUser(user_id);
      const postHost = await this.getUser(Number(post.created_by));
      user_id = user.id;
      const userSetting = await this.getUserSetting(user_id);

      let sentNotification = true;
      if (userSetting.length) {
        for (let i = 0; i < userSetting.length; i++) {
          sentNotification =
            userSetting[i].setting.key == 'community_when_comment_on_post' &&
            userSetting[i].setting.status == 'ACTIVE' &&
            userSetting[i].value == 'true'
              ? true
              : false;
          if (sentNotification == true) {
            const admin_notification = await firstValueFrom(
              this.adminClient.send<any>(
                'get_notification_by_type',
                'COMMUNITY_POST_COMMENT',
              ),
            );
            const joinRequestNotification = {
              notification_from: user_id,
              notification_to: post.created_by,
              payload: comment,
              title: admin_notification.notification_title
                .replace('*user*', user.general_profile.first_name)
                .replace('*community name*', community.name),
              content: admin_notification.notification_content
                .replace('*user*', user.general_profile.first_name)
                .replace('*community name*', community.name),
              type: admin_notification.notification_type,
            };

            await firstValueFrom(
              this.notificationClient.send<any>(
                'create_notification',
                JSON.stringify(joinRequestNotification),
              ),
            );
          }
        }
        const payload: IMailPayload = {
          template: 'COMMUNITY_POST_COMMENT',
          payload: {
            emails: [postHost.email],
            data: {
              host_name: postHost ? postHost.general_profile.first_name : '',
              community_name: community.name,
              user_name: `${user.general_profile.first_name} ${user.general_profile.last_name}`,
              link: `${this.configService.get<string>(
                'community_join_request_url',
              )}/${community.id}/postId=${timelinePost?.post_id}`,
            },
            subject: `Someone commented on your post`,
          },
        };

        this.mailClient.emit('send_email', payload);
      }
      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async pollComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.timelineRepository.findOne({
        where: {
          post_id: id,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

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
      const comment = new Comments();
      comment.comment = data.comment;
      comment.timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.commentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.poll = poll;
      comment.commented_by = user_id;

      const commented = await this.commentRepository.save(comment);
      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async articleComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.timelineRepository.findOne({
        where: {
          post_id: id,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const article = await this.communityArticleRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!article) {
        throw new HttpException(
          'ARTICLE_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const comment = new Comments();
      comment.comment = data.comment;
      comment.timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.commentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.article = article;
      comment.commented_by = user_id;

      const commented = await this.commentRepository.save(comment);
      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async locationComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.timelineRepository.findOne({
        where: {
          post_id: id,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const locationPost = await this.communityLocationPostRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!locationPost) {
        throw new HttpException(
          'LOCATION_POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const comment = new Comments();
      comment.comment = data.comment;
      comment.timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.commentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.share_location = locationPost;
      comment.commented_by = user_id;

      const commented = await this.commentRepository.save(comment);
      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteComment(id: number): Promise<any> {
    try {
      const comment = await this.commentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.commentRepository.delete(id);

      return {
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async shareContent(
    id: number,
    data: SharePostDto,
    user_id: number,
  ): Promise<any> {
    try {
      const community = await this.communityRepository.findOne({
        where: {
          id: data.community_id,
        },
      });

      if (!community) {
        throw new HttpException(
          'COMMUNITY_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let topics = null;
      if (data.topics && data.topics != '') {
        const topicIds = data.topics.split(',');

        topics = await this.communityTopicRepository.find({
          where: {
            id: In(topicIds),
          },
        });
      }

      const post = new SharedPosts();
      post.shared_content_id = data.shared_content_id;
      post.shared_content_type = data.shared_content_type;
      post.content = data.content;
      post.created_by = user_id;
      post.community = community;
      post.topics = topics;

      const postCreated = await this.communityPostRepository.save(post);

      const timeline = new CommunityTimeline();
      timeline.community_id = community.id;
      timeline.created_by = user_id;
      timeline.post_id = postCreated.id;
      timeline.post_type = POST_TYPE.SHARED_CONTENT;

      await this.timelineRepository.save(timeline);

      return postCreated;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async reportPost(data: ReportPostDto, user_id: number) {
    const post = await await this.timelineRepository.findOne({
      where: {
        id: data.id,
      },
    });
    if (!post) {
      throw new HttpException(
        'POST_NOT_FOUND',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const postReport = new PostReport();
    postReport.timeline_post = post;
    postReport.user_id = user_id;
    postReport.reason = data.reason;
    await this.postReportRepository.save(postReport);
    return {
      status: 200,
      message: 'Post reported successfully.',
    };
  }

  public async createGroupComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      if (data.post_type === 'POST') {
        return await this.postGroupComment(id, data, user_id);
      }

      if (data.post_type === 'POLL') {
        return await this.pollGroupComment(id, data, user_id);
      }

      if (data.post_type === 'ARTICLE') {
        return await this.articleGroupComment(id, data, user_id);
      }

      if (data.post_type === 'SHARE_LOCATION') {
        return await this.locationGroupComment(id, data, user_id);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateGroupComment(
    id: number,
    data: UpdateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const comment = await this.groupCommentRepository.findOne({
        where: {
          id: id,
          commented_by: user_id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.groupCommentRepository.update(id, data);

      return {
        message: 'Comment updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async groupPostCommentLike(
    id: number,
    data: PostCommentLikeDto,
    user_id: number,
  ): Promise<any> {
    try {
      const comment = await this.groupCommentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.groupPostCommentLikeRepository.findOne({
        where: {
          comments: {
            id: comment.id,
          },
          user_id: user_id,
        },
      });

      if (data.reaction_type === REACTION_TYPE.LIKE && !getReaction) {
        const reaction = new GroupPostCommentLike();
        reaction.comments = comment;
        reaction.user_id = user_id;
        reaction.reaction = data.reaction_type;

        await this.groupPostCommentLikeRepository.save(reaction);
      }
      if (data.reaction_type === REACTION_TYPE.DISLIKE && getReaction) {
        await this.groupPostCommentLikeRepository.delete(getReaction.id);
      }

      return {
        message: `${data.reaction_type} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteGroupComment(id: number): Promise<any> {
    try {
      const comment = await this.groupCommentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.groupCommentRepository.delete(id);

      return {
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async postGroupComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.groupTimelineRepository.findOne({
        where: {
          post_id: id,
          post_type: data.post_type,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const group = await firstValueFrom(
        this.communityClient.send<any>(
          'get_group_by_id',
          Number(timelinePost.group_id),
        ),
      );

      const post = await this.communityPostRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const comment = new GroupPostComments();
      comment.comment = data.comment;
      comment.group_timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.groupCommentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.post = post;
      comment.commented_by = user_id;

      const commented = await this.groupCommentRepository.save(comment);
      const postHost = await this.getUser(Number(post.created_by));
      const invitedUser = await this.getUser(Number(user_id));
      const admin_notification = await firstValueFrom(
        this.adminClient.send<any>(
          'get_notification_by_type',
          'GROUP_POST_COMMENT',
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
        notification_to: post.created_by,
        payload: comment,
      };

      await firstValueFrom(
        this.notificationClient.send<any>(
          'create_notification',
          JSON.stringify(joinRequestNotification),
        ),
      );
      const payload: IMailPayload = {
        template: 'GROUP_POST_COMMENT',
        payload: {
          emails: [postHost.email],
          data: {
            host_name: postHost ? postHost.general_profile.first_name : '',
            group_name: group.group_name,
            user_name: `${invitedUser.general_profile.first_name} ${invitedUser.general_profile.last_name}`,
            link: `${this.configService.get<string>(
              'group_join_request_url',
            )}/${timelinePost?.group_id}/postId=${timelinePost?.post_id}`,
          },
          subject: `Someone commented on your post`,
        },
      };

      this.mailClient.emit('send_email', payload);

      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async pollGroupComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.groupTimelineRepository.findOne({
        where: {
          post_id: id,
          post_type: data.post_type,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

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
      const comment = new GroupPostComments();
      comment.comment = data.comment;
      comment.group_timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.groupCommentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.poll = poll;
      comment.commented_by = user_id;

      const commented = await this.groupCommentRepository.save(comment);
      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async articleGroupComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.groupTimelineRepository.findOne({
        where: {
          post_id: id,
          post_type: data.post_type,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const article = await this.communityArticleRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!article) {
        throw new HttpException(
          'ARTICLE_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const comment = new GroupPostComments();
      comment.comment = data.comment;
      comment.group_timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.groupCommentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.article = article;
      comment.commented_by = user_id;

      const commented = await this.groupCommentRepository.save(comment);
      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async locationGroupComment(
    id: number,
    data: CreateCommentDto,
    user_id: number,
  ): Promise<any> {
    try {
      const timelinePost = await this.groupTimelineRepository.findOne({
        where: {
          post_id: id,
          post_type: data.post_type,
        },
      });

      if (!timelinePost) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const locationPost = await this.communityLocationPostRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!locationPost) {
        throw new HttpException(
          'LOCATION_POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const comment = new GroupPostComments();
      comment.comment = data.comment;
      comment.group_timeline_post = timelinePost;

      if (data.parent_comment_id && data.parent_comment_id > 0) {
        const parentComment = await this.groupCommentRepository.findOne({
          where: {
            id: data.parent_comment_id,
          },
        });

        if (!parentComment) {
          throw new HttpException(
            'COMMENT_NOT_FOUND',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        comment.parent_comment = parentComment.id;
        comment.parent = parentComment;
      }
      comment.share_location = locationPost;
      comment.commented_by = user_id;

      const commented = await this.groupCommentRepository.save(comment);
      return commented;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async pinCommunityPost(id: number, user_id: number) {
    try {
      const post = await this.timelineRepository.findOne({
        where: { id: id },
      });
      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const postPin = await this.postPinRepository.findOne({
        where: {
          timeline_post: {
            id: id,
          },
          user_id: user_id,
        },
      });
      if (postPin) {
        return {
          status: 500,
          message: 'Post already Pined.',
        };
      }
      const postCommunity = await this.communityRepository.findOne({
        where: {
          id: post.community_id,
          community_created_by: user_id,
        },
      });
      if (postCommunity) {
        const postReport = new PostPin();
        postReport.timeline_post = post;
        postReport.user_id = user_id;
        const postPinUpdate = await this.postPinRepository.save(postReport);
        await this.timelineRepository.update(id, {
          post_pin: postPinUpdate,
        });
        return postReport;
      } else {
        return {
          status: 500,
          message: 'You are not the host or moderator of this community',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  public async getPinedPost(id: number, user_id: number): Promise<any> {
    try {
      const timelinePost: any = await this.postPinRepository
        .createQueryBuilder('post_pin')
        .where('tId.community_id = :id', { id })
        .leftJoinAndSelect('post_pin.timeline_post', 'tId')
        .getMany();

      if (timelinePost.length) {
        for (let i = 0; i < timelinePost.length; i++) {
          const post: any = await this.communityPostRepository.findOne({
            where: {
              id: timelinePost[i].timeline_post.post_id,
            },
          });
          timelinePost[i].timeline_post.post_id = post;

          if (post && post.created_by) {
            const user = await this.getUser(post.created_by);
            timelinePost[i].timeline_post.post_id.created_by = user;
          }

          if (
            post &&
            post.is_share == TRUE_FALSE.TRUE &&
            post.post_share_type == POST_SHARE_TYPE.EVENT
          ) {
            const eventRes: any = await this.communityEventRepository.findOne({
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
            });

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
            post &&
            post.is_share == TRUE_FALSE.TRUE &&
            post.post_share_type == POST_SHARE_TYPE.MASTER_CLASS
          ) {
            const course = await firstValueFrom(
              this.masterClassClient.send('get_course_by_id', post.share_id),
            );
            post.share_id = course;
          }

          if (
            post &&
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
            post &&
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
            post &&
            post.is_share == TRUE_FALSE.TRUE &&
            post.post_share_type == POST_SHARE_TYPE.POST
          ) {
            const sharedPost: any = await this.communityPostRepository.findOne({
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
        }
      } else {
        return {
          status: 500,
          message: 'Post Not Found in This Community',
        };
      }

      return timelinePost;
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

  public async unPinPost(id: number, user_id: number): Promise<any> {
    try {
      const pinPost = await this.postPinRepository.findOne({
        where: { id: id, user_id: user_id },
      });

      if (!pinPost) {
        throw new HttpException(
          'PIN_POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.postPinRepository.delete(id);

      return {
        status: 200,
        message: 'Unpin Post successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async reportPostComment(data: ReportPostCommentDto, user_id: number) {
    const postComment = await this.commentRepository.findOne({
      where: {
        id: data.comment_id,
      },
    });
    if (!postComment) {
      throw new HttpException(
        'POST_COMMENT_NOT_FOUND',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const postReport = new PostCommentReport();
    postReport.comments = postComment;
    postReport.user_id = user_id;
    postReport.reason = data.reason;
    await this.postCommentReportRepository.save(postReport);
    return {
      status: 200,
      message: 'Post Comment reported successfully.',
    };
  }

  public async groupPostCommentHide(
    id: number,
    data: PostCommentHideDto,
    user_id: number,
  ): Promise<any> {
    try {
      const comment = await this.groupCommentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.groupPostCommentHideRepository.findOne({
        where: {
          comments: {
            id: comment.id,
          },
          user_id: user_id,
        },
      });

      if (data.post_comment_status === HIDE_UNHIDE.HIDE && !getReaction) {
        const reaction = new GroupPostCommentHide();
        reaction.comments = comment;
        reaction.user_id = user_id;
        reaction.post_comment_status = data.post_comment_status;

        await this.groupPostCommentHideRepository.save(reaction);
      }
      if (data.post_comment_status === HIDE_UNHIDE.UNHIDE && getReaction) {
        await this.groupPostCommentHideRepository.delete(getReaction.id);
      }

      return {
        message: `${data.post_comment_status} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async postCommentHide(
    id: number,
    data: PostCommentHideDto,
    user_id: number,
  ): Promise<any> {
    try {
      const comment = await this.commentRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!comment) {
        throw new HttpException(
          'COMMENT_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.postCommentHideRepository.findOne({
        where: {
          comments: {
            id: comment.id,
          },
          user_id: user_id,
        },
      });

      if (data.post_comment_status === HIDE_UNHIDE.HIDE && !getReaction) {
        const reaction = new PostCommentHide();
        reaction.comments = comment;
        reaction.user_id = user_id;
        reaction.post_comment_status = data.post_comment_status;

        await this.postCommentHideRepository.save(reaction);
      }
      if (data.post_comment_status === HIDE_UNHIDE.UNHIDE && getReaction) {
        await this.postCommentHideRepository.delete(getReaction.id);
      }

      return {
        message: `${data.post_comment_status} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async groupPostHide(
    id: number,
    data: PostHideDto,
    user_id: number,
  ): Promise<any> {
    try {
      const post = await this.groupTimelineRepository.findOne({
        where: { id: id },
      });
      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.groupPostHideRepository.findOne({
        where: {
          group_timeline_post: {
            id: post.id,
          },
          user_id: user_id,
        },
      });

      if (data.post_status === HIDE_UNHIDE.HIDE && !getReaction) {
        const reaction = new GroupPostHide();
        reaction.group_timeline_post = post;
        reaction.user_id = user_id;
        reaction.post_status = data.post_status;

        await this.groupPostHideRepository.save(reaction);
      }
      if (data.post_status === HIDE_UNHIDE.UNHIDE && getReaction) {
        await this.groupPostHideRepository.delete(getReaction.id);
      }

      return {
        message: `${data.post_status} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async PostHide(
    id: number,
    data: PostHideDto,
    user_id: number,
  ): Promise<any> {
    try {
      const post = await this.timelineRepository.findOne({
        where: { id: id },
      });
      if (!post) {
        throw new HttpException(
          'POST_NOT_FOUND',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const getReaction = await this.postHideRepository.findOne({
        where: {
          timeline_post: {
            id: post.id,
          },
          user_id: user_id,
        },
      });

      if (data.post_status === HIDE_UNHIDE.HIDE && !getReaction) {
        const reaction = new PostHide();
        reaction.timeline_post = post;
        reaction.user_id = user_id;
        reaction.post_status = data.post_status;

        await this.postHideRepository.save(reaction);
      }
      if (data.post_status === HIDE_UNHIDE.UNHIDE && getReaction) {
        await this.postHideRepository.delete(getReaction.id);
      }

      return {
        message: `${data.post_status} successfully`,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
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
      const currencyData = await firstValueFrom(
        this.adminClient.send<any>(
          'get_currency_by_id',
          user.expert_profile.rate_currency,
        ),
      );
      user.expert_profile.rate_currency = currencyData;
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
}
