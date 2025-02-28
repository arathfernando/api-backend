export enum YES_NO {
  YES = 'YES',
  NO = 'NO',
}

export enum REVIEW_FILTER {
  MOST_RELEVANT = 'MOST_RELEVANT',
  MOST_RECENT = 'MOST_RECENT',
}

export enum REACTION_TYPE {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}

export enum TRUE_FALSE {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

export enum COURSE_STATUS {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}
export enum STATUS {
  ALL = 'ALL',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum INVITE_STATUS {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export enum COURSE_PRIVACY {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum COURSE_INSTRUCTOR_PRIVACY {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum COURSE_ACCESS_TYPE {
  PAID = 'PAID',
  DRAFT = 'DRAFT',
  FREE = 'FREE',
  PRIVATE = 'PRIVATE',
}

export enum PRICING_CURRENCY {
  CASH = 'CASH',
  HBB_TOKEN = 'HBB_TOKEN',
}

export enum LESSON_TYPE {
  LESSON = 'LESSON',
  CHAPTER = 'CHAPTER',
}

export enum FILE_TYPE {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  AUDIO = 'AUDIO',
  FILE_ASSIGNMENT = 'FILE_ASSIGNMENT',
  QUIZ = 'QUIZ',
}

export enum QUESTION_TYPE {
  TEXT_OPTIONS = 'TEXT_OPTIONS',
  IMAGE_OPTIONS = 'IMAGE_OPTIONS',
  TRUE_OR_FALSE = 'TRUE_OR_FALSE',
  MULTIPLE_ANSWERS = 'MULTIPLE_ANSWERS',
}

export enum CONTENT_TYPE {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export enum REPORT_TYPE {
  NON_ORIGINAL_CONTENT = 'NON_ORIGINAL_CONTENT',
  INAPPROPRIATE_COURSE = 'INAPPROPRIATE_COURSE',
  COPYRIGHT_VALUATION = 'COPYRIGHT_VALUATION',
}

export enum SEEN_UNSEEN {
  SEEN = 'SEEN',
  UNSEEN = 'UNSEEN',
}

export enum COURSE_PRICING_TYPE {
  ONE_TIME = 'ONE_TIME',
  INSTALLMENT = 'INSTALLMENT',
}

export enum PAYMENT_METHOD {
  CREDIT_CARD = 'CREDIT_CARD',
  COMMUNITY_TOKEN = 'COMMUNITY_TOKEN',
  PAY_PAL = 'PAY_PAL',
}

export enum PAYMENT_OPTION {
  FULL_AMOUNT = 'FULL_AMOUNT',
  INSTALLMENT_PLAN = 'INSTALLMENT_PLAN',
}

export enum STATE {
  ALL = 'ALL',
  MY_CLASSES = 'MY_CLASSES',
  COURSE_ENROLLED = 'COURSE_ENROLLED',
}

export enum CLASS_SORT_BY {
  LAST_OPEN = 'LAST_OPEN',
  NEW_ACTIVITIES = 'NEW_ACTIVITIES',
  DATE_ASCENDING = 'DATE_ASCENDING',
  DATE_DESCENDING = 'DATE_DESCENDING',
}

export enum CLASS_FILTER {
  ALL = 'ALL',
  JUST_ADDED = 'JUST_ADDED',
  TRENDING = 'TRENDING',
  MOST_POPULAR = 'MOST_POPULAR',
  // RECENTLY_VIEWED = 'RECENTLY_VIEWED',
  SAVED_CLASSES = 'SAVED_CLASSES',
  MY_CLASSES = 'MY_CLASSES',
  COURSE_ENROLLED = 'COURSE_ENROLLED',
  KEEP_GOING = 'KEEP_GOING',
}

export enum DATE_FILTER {
  ALL = 'ALL',
  TODAY = 'TODAY',
  LAST_WEEK = 'LAST_WEEK',
  LAST_MONTH = 'LAST_MONTH',
  LAST_YEAR = 'LAST_YEAR',
}

export enum TIME_DURATION {
  LAST_WEEK = 'LAST_WEEK',
  LAST_MONTH = 'LAST_MONTH',
  LAST_3_MONTH = 'LAST_3_MONTH',
}

export enum OPEN_CLASS_FILTER {
  ALL = 'ALL',
  JUST_ADDED = 'JUST_ADDED',
  TRENDING = 'TRENDING',
  MOST_POPULAR = 'MOST_POPULAR',
  KEEP_GOING = 'KEEP_GOING',
  // RECENTLY_VIEWED = 'RECENTLY_VIEWED',
}
