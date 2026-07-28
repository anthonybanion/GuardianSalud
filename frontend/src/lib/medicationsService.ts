/**
 * Servicio de Medicamentos
 *
 * Endpoints:
 *  POST   /medications        → MedicationEntity  (crear)
 *  GET    /medications        → MedicationEntity[]
 *  GET    /medications/{id}   → MedicationEntity
 *  PATCH  /medications/{id}   → MedicationEntity
 *  DELETE /medications/{id}   → MedicationEntity
 */

import { apiFetch } from './api';
import type { BackendMedication, CreateMedicationDto, UpdateMedicationDto } from '@/types';

export const medicationsService = {
  /** GET /medications */
  async getAll(): Promise<BackendMedication[]> {
    return apiFetch<BackendMedication[]>('/medications');
  },

  /** GET /medications/{id} */
  async getById(id: string): Promise<BackendMedication> {
    return apiFetch<BackendMedication>(`/medications/${id}`);
  },

  /** POST /medications */
  async create(dto: CreateMedicationDto): Promise<BackendMedication> {
    return apiFetch<BackendMedication>('/medications', {
      method: 'POST',
      body: dto,
    });
  },

  /** PATCH /medications/{id} */
  async update(id: string, dto: UpdateMedicationDto): Promise<BackendMedication> {
    return apiFetch<BackendMedication>(`/medications/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },

  /** DELETE /medications/{id} */
  async remove(id: string): Promise<BackendMedication> {
    return apiFetch<BackendMedication>(`/medications/${id}`, {
      method: 'DELETE',
    });
  },
};
