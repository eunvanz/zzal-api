import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const isDev = process.env.NODE_ENV === 'development';

export default class TypeOrmConfig {
  static getOrmConfig(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: configService.get<string>('DATABASE_HOST') || '',
      port: Number(configService.get<string>('DATABASE_PORT')) || 3306,
      username: configService.get<string>('DATABASE_USERNAME') || '',
      password: configService.get<string>('DATABASE_PASSWORD') || '',
      database: configService.get<string>('DATABASE_NAME') || '',
      entities: isDev
        ? [join(__dirname, '..', '**', '*.entity{.ts,.js}')]
        : ['dist/**/*.entity{.ts,.js}'],
      synchronize: isDev,
      logging: isDev,
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => TypeOrmConfig.getOrmConfig(configService),
  inject: [ConfigService],
};
