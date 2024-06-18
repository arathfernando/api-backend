import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/helper/services/s3/s3.service';
import { Connection } from 'typeorm';
import { ProductLauncherController } from './product-launcher.controller';
import { ProductLauncherService } from './product-launcher.service';
import Admin from 'src/database/entities/admin.entity';
import ProductCategory from 'src/database/entities/product-category.entity';
import ProductSubCategory from 'src/database/entities/product-subcategory.entity';
import InnovationCategory from 'src/database/entities/innovation-category.entity';
import { ProductSubCategoryFaq } from 'src/database/entities/product-subcategory-faq.entity';
import TechCategory from 'src/database/entities/tech-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      ProductCategory,
      ProductSubCategory,
      InnovationCategory,
      ProductSubCategoryFaq,
      TechCategory,
    ]),
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_USER_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'PRODUCT_LAUNCHER',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_PRODUCT_LAUNCHER_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'MAIL_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_MAILER_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'TOKEN_SERVICE',
        imports: [ConfigModule],
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL],
            queue: process.env.RABBITMQ_TOKEN_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ProductLauncherService, S3Service],

  controllers: [ProductLauncherController],
})
export class ProductLauncherModule {}
