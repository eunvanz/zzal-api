import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sizeOf from 'image-size';
import { random } from 'lodash';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { S3Service } from 'src/s3/s3.service';
import { Tag } from 'src/tags/tags.entity';
import {
  In,
  Like,
  Repository,
  Transaction,
  TransactionRepository,
} from 'typeorm';
import { Content, Image } from './contents.entity';
import { CreateContentDto } from './dto/create-content-dto';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly s3Service: S3Service,
  ) {}

  @Transaction()
  async save(
    createContentDto: CreateContentDto,
    files: Express.Multer.File[],
    @TransactionRepository(Content) trxContentRepository?: Repository<Content>,
    @TransactionRepository(Image) trxImageRepository?: Repository<Image>,
    @TransactionRepository(Tag) trxTagRepository?: Repository<Tag>,
  ) {
    if (!files) {
      throw new BadRequestException('Files are required.');
    }
    const uploadResult = await Promise.all(
      files.map((file, index) =>
        this.s3Service.upload(
          file,
          `${createContentDto.path}${index === 0 ? '_thumbnail' : ''}`,
        ),
      ),
    );

    const existingContent = await trxContentRepository.findOne({
      path: createContentDto.path,
    });

    let contentId = undefined;
    if (existingContent) {
      contentId = existingContent.id;
      await trxImageRepository.delete({ contentId });
      await trxContentRepository.delete(contentId);
    }

    const tagNames =
      createContentDto.tags?.split(',').map((tag) => tag.trim()) || [];

    const existingTags =
      tagNames.length > 0
        ? await trxTagRepository.find({
            where: tagNames.map((name) => ({ name })),
          })
        : [];

    const newTags =
      tagNames.length > 0
        ? tagNames.filter((name) =>
            existingTags.every((existingTags) => existingTags.name !== name),
          )
        : [];

    const tags = [...existingTags, ...newTags.map((name) => ({ name }))];

    const savedContent = await trxContentRepository.save({
      ...createContentDto,
      viewCnt: existingContent?.viewCnt || 0,
      tags,
    });
    contentId = savedContent.id;

    const sizes = files.map((file) => sizeOf(file.buffer));

    const newImages = uploadResult.map((result, index) => ({
      url: result.Location,
      seq: index + 1,
      contentId: contentId,
      type: files[index].mimetype,
      width: sizes[index].width,
      height: sizes[index].height,
    }));

    await Promise.all(newImages.map((image) => trxImageRepository.save(image)));
  }

  @Transaction()
  async update(
    contentId: number,
    createContentDto: CreateContentDto,
    files: Express.Multer.File[],
    @TransactionRepository(Content) trxContentRepository?: Repository<Content>,
    @TransactionRepository(Image) trxImageRepository?: Repository<Image>,
    @TransactionRepository(Tag) trxTagRepository?: Repository<Tag>,
  ) {
    const existingContent = await trxContentRepository.findOne(contentId);
    if (!existingContent) {
      throw new NotFoundException();
    }

    const tagNames =
      createContentDto.tags?.split(',').map((tag) => tag.trim()) || [];

    const existingTags =
      tagNames.length > 0
        ? await trxTagRepository.find({
            where: tagNames.map((name) => ({ name })),
          })
        : [];

    const newTags =
      tagNames.length > 0
        ? tagNames.filter((name) =>
            existingTags.every((existingTags) => existingTags.name !== name),
          )
        : [];

    const createdNewTags = await Promise.all(
      newTags.map((name) => trxTagRepository.save({ name })),
    );

    const updatedContent = {
      ...existingContent,
      ...createContentDto,
      tags: [...existingTags, ...createdNewTags],
    };
    await trxContentRepository.save(updatedContent);

    if (files.length) {
      await trxImageRepository.delete({ contentId });

      const uploadResult = await Promise.all(
        files.map((file, index) =>
          this.s3Service.upload(
            file,
            `${createContentDto.path}${index === 0 ? '_thumbnail' : ''}`,
          ),
        ),
      );

      const sizes = files.map((file) => sizeOf(file.buffer));

      const newImages = uploadResult.map((result, index) => ({
        url: result.Location,
        seq: index + 1,
        contentId: contentId,
        type: files[index].mimetype,
        width: sizes[index].width,
        height: sizes[index].height,
      }));

      await Promise.all(
        newImages.map((image) => trxImageRepository.save(image)),
      );
    }
  }

  async getByPath(path: string) {
    const content = await this.contentRepository.findOne({ path });
    if (content) {
      this.contentRepository.update(content.id, {
        viewCnt: ++content.viewCnt,
      });
      return content;
    } else {
      return this.getRandomOneByTag(path);
    }
  }

  async checkIsExistingPath(path: string) {
    const content = await this.contentRepository.findOne({ path });
    return !!content;
  }

  async getRandomOneByTag(tagName: string) {
    const tag = await this.tagRepository.findOne({ name: tagName });

    if (!tag) {
      throw new NotFoundException();
    }

    const contents = await tag.contents;
    if (!contents.length) {
      throw new NotFoundException();
    }

    const index = random(contents.length - 1);

    const { id } = contents[index];

    return await this.contentRepository.findOne(id);
  }

  async getList(
    options: IPaginationOptions,
    orderBy: 'popularity' | 'latest',
    keyword?: string,
  ) {
    let orderByField = 'createdAt';
    switch (orderBy) {
      case 'popularity':
        orderByField = 'viewCnt';
    }

    if (keyword) {
      const tag = await this.tagRepository.findOne({
        name: Like(`%${keyword}%`),
      });
      const contents = tag ? await tag.contents : [];
      const result = await paginate<Content>(this.contentRepository, options, {
        order: {
          [orderByField]: 'DESC',
        },
        where: [
          {
            path: Like(`%${keyword}%`),
          },
          {
            id: In(contents.map((content) => content.id)),
          },
        ],
      });
      return result;
    } else {
      const result = await paginate<Content>(this.contentRepository, options, {
        order: {
          [orderByField]: 'DESC',
        },
      });
      return result;
    }
  }
}
