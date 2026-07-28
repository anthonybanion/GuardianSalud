import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTreatmentDto } from './create-treatment.dto';

export class UpdateTreatmentDto extends PartialType(
  OmitType(CreateTreatmentDto, ['resident_id', 'medication_id', 'prescribed_by'] as const),
) {}
