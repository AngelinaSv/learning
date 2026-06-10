import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/security/security.module';
import { UsersModule } from 'src/modules/users/users.module';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [SecurityModule, UsersModule],
  providers: [WsJwtGuard, WsExceptionFilter],
  exports: [WsJwtGuard, WsExceptionFilter],
})
export class CommonWebsocketModule {}
