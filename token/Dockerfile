FROM node:18.17.1-alpine

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN mkdir -p /var/www/token
WORKDIR /var/www/token
COPY package*.json ./
RUN npm install
COPY . .
CMD /wait && npm start
