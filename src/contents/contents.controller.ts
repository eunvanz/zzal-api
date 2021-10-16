import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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

  @Get()
  async getByPath(@Query('path') path: string) {
    return this.contentsService.getByPath(path);
  }

  @Get('existing')
  async checkIsExistingPath(@Query('path') path: string) {
    return this.contentsService.checkIsExistingPath(path);
  }

  @Get('random/:tag')
  async getRandomOneByTag(@Param('tag') tagName: string) {
    return this.contentsService.getRandomOneByTag(tagName);
  }
}
