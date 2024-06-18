
# Hubbers

Hubbers is the unique creation of the founder Benjamin Vignon, friends, colleagues, and partners worldwide. Benjamin Vignon is a French expatriate living in South East Asia and a graduate of Korea University. With several decades of experience in product development, he created Hubbers as a method of promoting entrepreneurship around the world and fast-tracking the product development process for startups, product developers, engineers, etc.





## API Documentation

[Admin Service](https://dev.hubbers.io/admin/docs)

[Users Service](https://dev.hubbers.io/user/docs)

[Community Service](https://dev.hubbers.io/community/docs)


## Code Insights & Dependencies

 - This project contains complete micro service architecture
 - Mainly each modules are divided into different micro services
 - Each micro-service runs on different port
 - For sevice communication we're using [RabbitMQ](https://linuxhint.com/install-rabbitmq-ubuntu/)
 - For caching we're using [Redis](https://phoenixnap.com/kb/install-redis-on-ubuntu-20-04)
 - We're using postgres DB
 - For process management install [PM2](https://pm2.io/docs/runtime/guide/installation/)


## Environment Variables

- Each service contains .env.example 
- Copy .env.example and create .env file with required details


## Installation

Install all services dependencies
```bash
  cd hubbers
  sh install.sh
```

Build All services
```bash
  sh build.sh
```

Run All services
```bash
  sh dev-run.sh
```