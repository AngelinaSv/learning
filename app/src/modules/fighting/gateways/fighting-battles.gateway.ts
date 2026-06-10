import { Logger, OnModuleDestroy, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  WsExceptionFilter,
  WsJwtGuard,
} from 'src/common/websocket';
import { getAllowedCorsOrigins } from 'src/common/cors-origins';
import { MakeFightingMoveDto } from '../dto/requests/make-fighting-move.dto';
import { FightingBattlesService } from '../services/fighting-battles.service';
import { FightingMatchmakingService } from '../services/fighting-matchmaking.service';
import { FightingBattleRealtimeEvent } from '../types/fighting-battle.types';

interface FightingBattlePayload {
  battleId: string;
}

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  namespace: '/fighting',
  cors: { origin: getAllowedCorsOrigins(), credentials: true },
})
export class FightingBattlesGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(FightingBattlesGateway.name);
  private readonly battleRoomsByClient = new Map<string, Set<string>>();
  private battleEventListener?: (event: FightingBattleRealtimeEvent) => void;

  constructor(
    private readonly fightingBattlesService: FightingBattlesService,
    private readonly fightingMatchmakingService: FightingMatchmakingService,
    private readonly wsJwtGuard: WsJwtGuard,
  ) {}

  afterInit() {
    this.battleEventListener = (event) => {
      this.server
        .to(this.getBattleRoomName(event.battleId))
        .emit(event.event, event.payload);
    };
    this.fightingBattlesService.onBattleEvent(this.battleEventListener);
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.wsJwtGuard.authenticate(client);
      await client.join(this.getUserRoomName(user.id));
      this.logger.log(
        `Client ${client.id} connected to fighting as ${user.username}`,
      );
    } catch {
      client.emit('fightingBattleError', {
        status: 'error',
        event: 'connection',
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.battleRoomsByClient.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected from fighting`);
  }

  onModuleDestroy() {
    if (this.battleEventListener) {
      this.fightingBattlesService.offBattleEvent(this.battleEventListener);
    }
  }

  @SubscribeMessage('findFightingOpponent')
  async handleFindFightingOpponent(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const user = await this.wsJwtGuard.authenticate(client);
      const userRoomName = this.getUserRoomName(user.id);

      await client.join(userRoomName);

      const result = await this.fightingMatchmakingService.findOpponent(
        user.id,
        client.id,
      );

      if (result.status === 'waiting') {
        client.emit('fightingMatchmakingWaiting', result.payload);
        return result.payload;
      }

      this.server
        .to(this.getUserRoomName(result.opponent.userId))
        .emit('fightingMatchFound', result.payload);
      this.server.to(userRoomName).emit('fightingMatchFound', result.payload);

      return result.payload;
    } catch (error) {
      return this.emitBattleError(client, 'findFightingOpponent', error);
    }
  }

  @SubscribeMessage('cancelFightingMatchmaking')
  async handleCancelFightingMatchmaking(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const user = await this.wsJwtGuard.authenticate(client);
      const userRoomName = this.getUserRoomName(user.id);

      await client.join(userRoomName);

      const payload = await this.fightingMatchmakingService.cancel(user.id);

      this.server
        .to(userRoomName)
        .emit('fightingMatchmakingCancelled', payload);

      return payload;
    } catch (error) {
      return this.emitBattleError(client, 'cancelFightingMatchmaking', error);
    }
  }

  @SubscribeMessage('joinFightingBattle')
  async handleJoinFightingBattle(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: FightingBattlePayload | undefined,
  ) {
    try {
      const user = await this.wsJwtGuard.authenticate(client);
      this.ensureBattlePayload(payload);

      const battleState =
        await this.fightingBattlesService.getBattleStateForParticipant(
          payload.battleId,
          user.id,
        );
      const roomName = this.getBattleRoomName(payload.battleId);

      await client.join(roomName);
      this.trackClientRoom(client.id, roomName);
      client.emit('fightingBattleState', battleState);

      return {
        status: 'success',
        battleId: payload.battleId,
      };
    } catch (error) {
      return this.emitBattleError(client, 'joinFightingBattle', error);
    }
  }

  @SubscribeMessage('leaveFightingBattle')
  async handleLeaveFightingBattle(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: FightingBattlePayload | undefined,
  ) {
    try {
      await this.wsJwtGuard.authenticate(client);
      this.ensureBattlePayload(payload);

      const roomName = this.getBattleRoomName(payload.battleId);
      await client.leave(roomName);
      this.untrackClientRoom(client.id, roomName);

      return {
        status: 'success',
        battleId: payload.battleId,
      };
    } catch (error) {
      return this.emitBattleError(client, 'leaveFightingBattle', error);
    }
  }

  @SubscribeMessage('makeFightingMove')
  async handleMakeFightingMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MakeFightingMoveDto | undefined,
  ) {
    try {
      const user = await this.wsJwtGuard.authenticate(client);

      if (!payload?.battleId || !payload.attackZone || !payload.defenseZone) {
        throw new Error('Invalid fighting move payload');
      }

      const roomName = this.getBattleRoomName(payload.battleId);

      if (!client.rooms.has(roomName)) {
        throw new Error('You must join the battle room before making a move');
      }

      const result = await this.fightingBattlesService.makeMove(
        user.id,
        payload,
      );

      return {
        status: 'success',
        battleId: payload.battleId,
        round: result.roundResult?.round ?? result.battle.currentRound,
        isResolved: Boolean(result.roundResult),
      };
    } catch (error) {
      return this.emitBattleError(client, 'makeFightingMove', error);
    }
  }

  private ensureBattlePayload(
    payload: FightingBattlePayload | undefined,
  ): asserts payload is FightingBattlePayload {
    if (!payload?.battleId) {
      throw new Error('Battle ID is required');
    }
  }

  private trackClientRoom(clientId: string, room: string) {
    const rooms = this.battleRoomsByClient.get(clientId) || new Set<string>();
    rooms.add(room);
    this.battleRoomsByClient.set(clientId, rooms);
  }

  private untrackClientRoom(clientId: string, room: string) {
    const rooms = this.battleRoomsByClient.get(clientId);

    if (!rooms) {
      return;
    }

    rooms.delete(room);

    if (rooms.size === 0) {
      this.battleRoomsByClient.delete(clientId);
      return;
    }

    this.battleRoomsByClient.set(clientId, rooms);
  }

  private emitBattleError(client: Socket, event: string, error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to process fighting battle event';
    const payload = {
      status: 'error',
      event,
      message,
      timestamp: new Date().toISOString(),
    };

    client.emit('fightingBattleError', payload);

    return payload;
  }

  private getBattleRoomName(battleId: string) {
    return `fighting:battle:${battleId}`;
  }

  private getUserRoomName(userId: string) {
    return `fighting:user:${userId}`;
  }
}
