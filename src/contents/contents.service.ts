import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sizeOf from 'image-size';
import { S3Service } from 'src/s3/s3.service';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { Content, Image } from './contents.entity';
import { CreateContentDto } from './dto/create-content-dto';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly s3Service: S3Service,
  ) {}

  @Transaction()
  async save(
    createContentDto: CreateContentDto,
    files: Express.Multer.File[],
    @TransactionRepository(Content) trxContentRepository?: Repository<Content>,
    @TransactionRepository(Image) trxImageRepository?: Repository<Image>,
  ) {
    if (!files) {
      throw new BadRequestException('Files are required.');
    }
    const uploadResult = await Promise.all(
      files.map((file) => this.s3Service.upload(file, createContentDto.path)),
    );

    const existingContent = await trxContentRepository.findOne({
      path: createContentDto.path,
    });

    let contentId = undefined;
    if (existingContent) {
      contentId = existingContent.id;
      await trxContentRepository.delete(contentId);
      await trxImageRepository.delete({ contentId });
    }
    const savedContent = await trxContentRepository.save({
      ...createContentDto,
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

  async getByPath(path: string) {
    try {
      return await this.contentRepository.findOneOrFail({ path });
    } catch {
      throw new NotFoundException();
    }
  }

  async checkIsExistingPath(path: string) {
    const content = await this.contentRepository.findOne({ path });
    return !!content;
  }
}
