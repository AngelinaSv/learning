import {
  DynamicModule,
  Global,
  Logger,
  Module,
  Provider,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger(RedisModule.name);

        const options: RedisOptions = {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: Number(configService.get<string>('REDIS_PORT', '6379')),
          db: Number(configService.get<string>('REDIS_DB', '0')),
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            return Math.min(times * 50, 2000);
          },
        };

        const password = configService.get<string>('REDIS_PASSWORD');
        if (password) options.password = password;

        const client = new Redis(options);

        client.on('connect', () => logger.log('Connected to Redis'));
        client.on('error', (error) =>
          logger.error(`Redis connection error: ${error.message}`),
        );

        return client;
      },
      inject: [ConfigService],
    };

    return {
      module: RedisModule,
      imports: [ConfigModule],
      controllers: [RedisController],
      providers: [redisProvider, RedisService],
      exports: [RedisService, REDIS_CLIENT],
    };
  }
}
