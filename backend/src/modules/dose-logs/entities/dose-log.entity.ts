import { DoseStatus } from '@prisma/client';

export class DoseLogEntity {
  id: string;
  treatment_id: string;
  resident_id: string;
  staff_id: string;
  scheduled_at: string;
  administered_at: string | null;
  status: DoseStatus;
  omission_reason: string | null;
}
