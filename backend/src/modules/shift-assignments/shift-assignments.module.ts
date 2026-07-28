import { Module } from '@nestjs/common';

import { ShiftAssignmentsController } from './shift-assignments.controller';
import { ShiftAssignmentsService } from './shift-assignments.service';
import { ShiftAssignmentsRepository } from './shift-assignments.repository';

@Module({
  controllers: [ShiftAssignmentsController],
  providers: [ShiftAssignmentsService, ShiftAssignmentsRepository],
  exports: [ShiftAssignmentsService],
})
export class ShiftAssignmentsModule {}
