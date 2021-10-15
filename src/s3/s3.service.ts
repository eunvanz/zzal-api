import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import path from 'path';

@Injectable()
export class S3Service {
  private s3 = new AWS.S3();

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async upload(file: Express.Multer.File, prefix?: string) {
    const { originalname } = file;
    const fileExtension = path.extname(originalname);
    const fileName = `${prefix || nanoid(4)}_${Date.now()}.${fileExtension}`;
    return (await this.uploadS3(
      file.buffer,
      fileName,
    )) as Promise<AWS.S3.ManagedUpload.SendData>;
  }

  async uploadS3(file: Buffer, name: string) {
    const s3 = this.s3;
    return new Promise((resolve, reject) => {
      s3.upload(
        {
          Body: file,
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `images/${name}`,
        },
        (err, data) => {
          if (err) {
            reject(err.message);
          }
          resolve(data);
        },
      );
    });
  }
}
