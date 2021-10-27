import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/s3/s3.service';
import { Tag } from 'src/tags/tags.entity';
import { ContentsController } from './contents.controller';
import { Content, Image } from './contents.entity';
import { ContentsService } from './contents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Content, Image, Tag]), HttpModule],
  controllers: [ContentsController],
  providers: [ContentsService, S3Service],
})
export class ContentsModule {}
