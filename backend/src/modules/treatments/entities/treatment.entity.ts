export class TreatmentEntity {
  id: string;
  resident_id: string;
  medication_id: string;
  prescribed_by: string;
  assigned_staff_id: string;
  prescribed_dose: string;
  frequency_hours: number;
  start_time: string;
  is_critical: boolean;
  ai_instructions: string | null;
  is_temporary: boolean;
}
