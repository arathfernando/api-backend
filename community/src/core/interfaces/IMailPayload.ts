export interface IMailPayload {
  template: keyof typeof EmailTemplates;
  payload: PayloadType;
}

enum EmailTemplates {
  INVITE_USER_TO_COMMUNITY = 'invite-community-member',
  INVITE_USER_TO_GROUP = 'invite-group-member',
  JOIN_REQUEST = 'join-request',
  INVITE_USER_TO_COMMUNITY_DYNAMIC = 'invite-community-dynamic-member',
  INVITE_USER_TO_GROUP_DYNAMIC = 'invite-community-dynamic-member',
  INVITE_CO_ORGANIZER = 'contest-co',
  COMMUNITY_CREATE = 'community-create',
  COMMUNITY_POST_COMMENT = 'community-post-comment',
  GROUP_POST_COMMENT = 'group-post-comment',
  EVENT_TIME_UPDATE = 'event-time-update',
  CONTEST_CONTESTANT_JOIN_REQUEST = 'contest-contestant-join-request',
  CONTEST_JUDGE_JOIN_REQUEST = 'contest-judge-join-request',
  CONTEST_CONTESTANT_ACCEPT = 'contest-contestant-accept',
  CONTEST_JUDGE_ACCEPT = 'contest-judge-accept',
  GENERATE_OTP = 'generate-otp',
}

interface PayloadType {
  emails: string[];
  subject: string;
  data: any;
}
