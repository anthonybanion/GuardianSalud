import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';

@Module({
  imports: [UsersModule],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository],
  exports: [StaffService],
})
export class StaffModule {}
