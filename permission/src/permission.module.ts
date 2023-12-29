import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';

@Module({
  imports: [],
  controllers: [PermissionController],
  providers: [],
})
export class PermissionModule {}
