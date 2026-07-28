import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDoseLogDto } from './create-dose-log.dto';

export class UpdateDoseLogDto extends PartialType(
  OmitType(CreateDoseLogDto, ['treatment_id', 'resident_id'] as const),
) {}
