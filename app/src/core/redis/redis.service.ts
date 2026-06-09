import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  get client(): Redis {
    return this.redisClient;
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
      return;
    }

    await this.redisClient.set(key, value);
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async healthCheck() {
    const key = 'redis:health';
    const value = new Date().toISOString();

    await this.set(key, value, 30);
    const storedValue = await this.get(key);

    return {
      status: storedValue === value ? 'ok' : 'error',
      key,
      writtenValue: value,
      readValue: storedValue,
    };
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
