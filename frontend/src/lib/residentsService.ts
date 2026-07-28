/**
 * Servicio de Residents (Residentes / Pacientes)
 *
 * Endpoints:
 *  POST   /residents        → ResidentEntity
 *  GET    /residents        → ResidentEntity[]
 *  GET    /residents/{id}   → ResidentEntity
 *  PATCH  /residents/{id}   → ResidentEntity
 *  DELETE /residents/{id}   → ResidentEntity
 */

import { apiFetch } from './api';
import type { BackendResident, CreateResidentDto, UpdateResidentDto } from '@/types';

export const residentsService = {
  async getAll(): Promise<BackendResident[]> {
    return apiFetch<BackendResident[]>('/residents');
  },

  async getById(id: string): Promise<BackendResident> {
    return apiFetch<BackendResident>(`/residents/${id}`);
  },

  async create(dto: CreateResidentDto): Promise<BackendResident> {
    return apiFetch<BackendResident>('/residents', { method: 'POST', body: dto });
  },

  async update(id: string, dto: UpdateResidentDto): Promise<BackendResident> {
    return apiFetch<BackendResident>(`/residents/${id}`, { method: 'PATCH', body: dto });
  },

  async remove(id: string): Promise<BackendResident> {
    return apiFetch<BackendResident>(`/residents/${id}`, { method: 'DELETE' });
  },
};
