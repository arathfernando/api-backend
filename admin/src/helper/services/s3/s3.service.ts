import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}

  AWS_S3_BUCKET = this.configService.get('aws.s3Bucket');
  s3 = new AWS.S3(this.configService.get('aws.auth'));

  async uploadFile(file) {
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
  }

  async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'eu-central-1',
      },
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (e) {
      console.log('ERROR FROM S3 SERVICE', e);
    }
  }
}
