import { ShiftType } from '@prisma/client';

export class StaffEntity {
  id: string;
  user_id: string;
  specialties: string | null;
  preferred_shift: ShiftType | null;
}
