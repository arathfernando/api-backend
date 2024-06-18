export default () => ({
  node_env: process.env.NODE_ENV,
  port: process.env.SERVER_PORT,
  host: process.env.SERVER_HOST,
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    notification_queue: process.env.RABBITMQ_NOTIFICATION_QUEUE,
    chat_queue: process.env.RABBITMQ_CHAT_QUEUE,
    token_queue: process.env.RABBITMQ_TOKEN_QUEUE,
    mailer_queue: process.env.RABBITMQ_MAILER_QUEUE,
    user_queue: process.env.RABBITMQ_USER_QUEUE,
    community_queue: process.env.RABBITMQ_COMMUNITY_QUEUE,
    admin_queue: process.env.RABBITMQ_ADMIN_QUEUE,
  },
  database: {
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_name: process.env.DB_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  firebase: {
    firebase_project_id: process.env.FIREBASE_PROJECT_ID,
    firebase_private_key: process.env.FIREBASE_PRIVATE_KEY,
    firebase_client_email: process.env.FIREBASE_CLIENT_EMAIL,
    firebase_database_url: process.env.FIREBASE_DATABASE_URL,
  },
});
