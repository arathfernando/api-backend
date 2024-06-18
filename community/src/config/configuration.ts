export default () => ({
  host: process.env.SERVER_HOST,
  port: parseInt(process.env.SERVER_PORT, 10) || 2930,
  join_community_url: process.env.JOIN_COMMUNITY_URL,
  join_group_url: process.env.JOIN_GROUP_URL,
  community_join_request_url: process.env.COMMUNITY_JOIN_REQUEST_URL,
  contest_join_request_url: process.env.CONTEST_JOIN_REQUEST_URL,
  event_url: process.env.EVENT_URL,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    token_queue: process.env.RABBITMQ_TOKEN_QUEUE,
    mail_queue: process.env.RABBITMQ_MAILER_QUEUE,
    user_queue: process.env.RABBITMQ_USER_QUEUE,
    community_queue: process.env.RABBITMQ_COMMUNITY_QUEUE,
  },
  aws: {
    s3Bucket: process.env.AWS_BUCKET,
    awsStorageURL: process.env.AWS_STORAGE_URL,
    presignedExpire: process.env.AWS_EXPIRE_LINK,
    auth: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    },
  },
});
