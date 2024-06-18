export default () => ({
  node_env: process.env.NODE_ENV,
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    token_queue: process.env.RABBITMQ_TOKEN_QUEUE,
  },
  auth: {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    verification_token_secret: process.env.VERIFICATION_TOKEN_SECRET,
    access_token_exp: process.env.ACCESS_TOKEN_EXP,
    refresh_token_exp: process.env.REFRESH_TOKEN_EXP,
    verification_token_exp: process.env.VERIFICATION_TOKEN_EXP,
    community_invite_token_secret: process.env.COMMUNITY_INVITE_TOKEN_SECRET,
    community_invite_token_exp: process.env.COMMUNITY_INVITE_TOKEN_EXP,
  },
});
