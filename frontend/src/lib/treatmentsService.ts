/**
 * Servicio de Treatments (Tratamientos / Asignación de Dosis)
 *
 * Endpoints:
 *  POST   /treatments        → TreatmentEntity  (crear tratamiento)
 *  GET    /treatments        → TreatmentEntity[]
 *  GET    /treatments/{id}   → TreatmentEntity
 *  PATCH  /treatments/{id}   → TreatmentEntity
 *  DELETE /treatments/{id}   → TreatmentEntity
 */

import { apiFetch } from './api';
import type { BackendTreatment, CreateTreatmentDto, UpdateTreatmentDto } from '@/types';

export const treatmentsService = {
  /** GET /treatments */
  async getAll(): Promise<BackendTreatment[]> {
    return apiFetch<BackendTreatment[]>('/treatments');
  },

  /** GET /treatments/{id} */
  async getById(id: string): Promise<BackendTreatment> {
    return apiFetch<BackendTreatment>(`/treatments/${id}`);
  },

  /** POST /treatments — prescribir un tratamiento nuevo */
  async create(dto: CreateTreatmentDto): Promise<BackendTreatment> {
    return apiFetch<BackendTreatment>('/treatments', {
      method: 'POST',
      body: dto,
    });
  },

  /** PATCH /treatments/{id} */
  async update(id: string, dto: UpdateTreatmentDto): Promise<BackendTreatment> {
    return apiFetch<BackendTreatment>(`/treatments/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },

  /** DELETE /treatments/{id} */
  async remove(id: string): Promise<BackendTreatment> {
    return apiFetch<BackendTreatment>(`/treatments/${id}`, {
      method: 'DELETE',
    });
  },
};
