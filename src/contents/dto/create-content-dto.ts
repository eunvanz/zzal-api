import { IsOptional, IsString } from 'class-validator';

export class CreateContentDto {
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;
}
