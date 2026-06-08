import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RedisService } from 'src/core/redis/redis.service';
import {
  FIGHTING_DUEL_REQUEST_TTL_SECONDS,
  FIGHTING_PENDING_DUEL_REQUESTS_KEY,
} from '../constants/fighting.constants';
import { CreateFightingDuelRequestDto } from '../dto/create-fighting-duel-request.dto';
import {
  FightingDuelAcceptResult,
  FightingDuelRequest,
} from '../types/fighting-duel-request.types';
import { FightingBattlesService } from './fighting-battles.service';

@Injectable()
export class FightingDuelRequestsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly fightingBattlesService: FightingBattlesService,
  ) {}

  async create(
    challengerId: string,
    dto: CreateFightingDuelRequestDto,
  ): Promise<FightingDuelRequest> {
    if (dto.opponentId && dto.opponentId === challengerId) {
      throw new BadRequestException('Cannot create a duel request to yourself');
    }

    const request: FightingDuelRequest = {
      id: randomUUID(),
      challengerId,
      opponentId: dto.opponentId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await this.redisService.set(
      this.getDuelRequestKey(request.id),
      JSON.stringify(request),
      FIGHTING_DUEL_REQUEST_TTL_SECONDS,
    );
    await this.redisService.client.sadd(
      FIGHTING_PENDING_DUEL_REQUESTS_KEY,
      request.id,
    );

    return request;
  }

  async findPending(currentUserId: string): Promise<FightingDuelRequest[]> {
    const requestIds = await this.redisService.client.smembers(
      FIGHTING_PENDING_DUEL_REQUESTS_KEY,
    );
    const requests = await Promise.all(
      requestIds.map((id) => this.getDuelRequest(id)),
    );
    const staleRequestIds: string[] = [];

    const pendingRequests = requests.flatMap((request, index) => {
      if (!request) {
        staleRequestIds.push(requestIds[index]);
        return [];
      }

      if (
        request.status !== 'pending' ||
        request.challengerId === currentUserId ||
        (request.opponentId && request.opponentId !== currentUserId)
      ) {
        return [];
      }

      return [request];
    });

    if (staleRequestIds.length > 0) {
      await this.redisService.client.srem(
        FIGHTING_PENDING_DUEL_REQUESTS_KEY,
        ...staleRequestIds,
      );
    }

    return pendingRequests;
  }

  async accept(
    requestId: string,
    userId: string,
  ): Promise<FightingDuelAcceptResult> {
    const request = await this.getDuelRequest(requestId);

    if (!request) {
      throw new NotFoundException('Duel request not found');
    }

    if (request.challengerId === userId) {
      throw new BadRequestException('Cannot accept your own duel request');
    }

    if (request.status !== 'pending') {
      throw new ConflictException('Duel request is not pending');
    }

    if (request.opponentId && request.opponentId !== userId) {
      throw new ConflictException('Duel request is reserved for another user');
    }

    const battleRoom = await this.fightingBattlesService.createBattleRoom(
      request.challengerId,
      userId,
    );
    const acceptedRequest: FightingDuelRequest = {
      ...request,
      opponentId: userId,
      status: 'accepted',
      battleRoomId: battleRoom.id,
    };

    await this.redisService.set(
      this.getDuelRequestKey(request.id),
      JSON.stringify(acceptedRequest),
      FIGHTING_DUEL_REQUEST_TTL_SECONDS,
    );
    await this.redisService.client.srem(
      FIGHTING_PENDING_DUEL_REQUESTS_KEY,
      request.id,
    );

    return {
      duelRequest: acceptedRequest,
      battleRoom,
    };
  }

  private async getDuelRequest(
    requestId: string,
  ): Promise<FightingDuelRequest | null> {
    const rawRequest = await this.redisService.get(
      this.getDuelRequestKey(requestId),
    );

    return rawRequest ? (JSON.parse(rawRequest) as FightingDuelRequest) : null;
  }

  private getDuelRequestKey(requestId: string) {
    return `fighting:duel-request:${requestId}`;
  }
}
