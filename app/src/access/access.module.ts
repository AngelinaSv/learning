import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role/entities/role.entity';
import { Permission } from './permission/entities/permisson.entity';
import { RoleModule } from './role/role.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), RoleModule],
  exports: [RoleModule],
})
export class AccessModule {}