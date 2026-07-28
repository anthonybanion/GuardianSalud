export class MedicationEntity {
  id: string;
  commercial_name: string;
  active_ingredient: string | null;
  concentration: string | null;
  presentation: string | null;
  administration_route: string;
  current_stock: number;
  minimum_stock: number;
}
