import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Session } from './entities';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(params: {
    userId: string;
    refreshToken: string;
    ttlDays?: number;
  }) {
    const { userId, refreshToken, ttlDays = 7 } = params;

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    const session = this.sessionRepository.create({
      user: { id: userId } as User,
      refreshTokenHash,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  async findById(sessionId: string) {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
    });
  }

  async validateSession(
    sessionId: string,
    refreshToken: string,
  ): Promise<Session> {
    const session = await this.findById(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return session;
  }

  async rotateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
    ttlDays = 7,
  ) {
    const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    await this.updateSession(sessionId, {
      refreshTokenHash,
      expiresAt,
    });
  }

  async deleteSession(sessionId: string) {
    await this.sessionRepository.delete(sessionId);
  }

  async updateSession(sessionId: string, params: Partial<Session>) {
    return this.sessionRepository.update(sessionId, {
      ...params,
    });
  }
}
