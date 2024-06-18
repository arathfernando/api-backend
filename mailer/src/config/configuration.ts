export default () => ({
  node_env: process.env.NODE_ENV,
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    token_queue: process.env.RABBITMQ_TOKEN_QUEUE,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
