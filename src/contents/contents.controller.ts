import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content-dto';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async save(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createContentDto: CreateContentDto,
  ) {
    this.contentsService.save(createContentDto, files);
  }
}
