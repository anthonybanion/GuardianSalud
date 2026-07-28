import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateShiftAssignmentDto } from './create-shift-assignment.dto';

export class UpdateShiftAssignmentDto extends PartialType(
  OmitType(CreateShiftAssignmentDto, ['staff_id'] as const),
) {}
