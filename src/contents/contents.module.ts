import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/s3/s3.service';
import { ContentsController } from './contents.controller';
import { Content, Image } from './contents.entity';
import { ContentsService } from './contents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Content, Image])],
  controllers: [ContentsController],
  providers: [ContentsService, S3Service],
})
export class ContentsModule {}
