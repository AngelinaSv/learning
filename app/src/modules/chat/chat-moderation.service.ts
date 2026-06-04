import { Injectable } from '@nestjs/common';
import { FORBIDDEN_PATTERNS } from './constants/chat-moderation.constants';

@Injectable()
export class ChatModerationService {
  containsForbiddenContent(message: string): boolean {
    const normalizedMessage = this.normalizeMessage(message);

    return FORBIDDEN_PATTERNS.some((pattern) =>
      normalizedMessage.includes(pattern),
    );
  }

  sanitizeMessage(message: string): string {
    return FORBIDDEN_PATTERNS.reduce(
      (sanitizedMessage, pattern) =>
        sanitizedMessage.replaceAll(
          new RegExp(this.escapeRegExp(pattern), 'gi'),
          '***',
        ),
      message.trim(),
    );
  }

  private normalizeMessage(message: string): string {
    return message.trim().toLowerCase();
  }

  private escapeRegExp(pattern: string): string {
    return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
