import { ShiftType } from '@prisma/client';

export class ShiftAssignmentEntity {
  id: string;
  staff_id: string;
  shift_type: ShiftType;
  shift_date: string;
  assigned_area: string | null;
}
