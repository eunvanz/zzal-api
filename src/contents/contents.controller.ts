import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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

  @Get('existing')
  async checkIsExistingPath(@Query('path') path: string) {
    return this.contentsService.checkIsExistingPath(path);
  }

  @Get('random/:tag')
  async getRandomOneByTag(@Param('tag') tagName: string) {
    return this.contentsService.getRandomOneByTag(tagName);
  }

  @Put(':contentId')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('contentId') contentId: number,
    @Body() createContentDto: CreateContentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    this.contentsService.update(contentId, createContentDto, files);
  }

  @Get()
  async getList(
    @Query('path') path?: string,
    @Query('orderBy') orderBy: 'popularity' | 'latest' = 'latest',
    @Query('tags') tags?: string[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    if (path) {
      return this.contentsService.getByPath(path);
    } else {
      return this.contentsService.getList({ page, limit }, orderBy, tags);
    }
  }
}
