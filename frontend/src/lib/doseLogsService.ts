/**
 * Servicio de Dose Logs (Bitácora de dosis)
 *
 * Endpoints:
 *  POST   /dose-logs        → DoseLogEntity  (registrar dosis)
 *  GET    /dose-logs        → DoseLogEntity[]
 *  GET    /dose-logs/{id}   → DoseLogEntity
 *  PATCH  /dose-logs/{id}   → DoseLogEntity
 *  DELETE /dose-logs/{id}   → DoseLogEntity
 */

import { apiFetch } from './api';
import type { BackendDoseLog, CreateDoseLogDto, UpdateDoseLogDto } from '@/types';

export const doseLogsService = {
  /** GET /dose-logs — historial completo */
  async getAll(): Promise<BackendDoseLog[]> {
    return apiFetch<BackendDoseLog[]>('/dose-logs');
  },

  /** GET /dose-logs/{id} */
  async getById(id: string): Promise<BackendDoseLog> {
    return apiFetch<BackendDoseLog>(`/dose-logs/${id}`);
  },

  /** POST /dose-logs — registrar aplicación u omisión de dosis */
  async create(dto: CreateDoseLogDto): Promise<BackendDoseLog> {
    return apiFetch<BackendDoseLog>('/dose-logs', {
      method: 'POST',
      body: dto,
    });
  },

  /** PATCH /dose-logs/{id} — actualizar estado o motivo de omisión */
  async update(id: string, dto: UpdateDoseLogDto): Promise<BackendDoseLog> {
    return apiFetch<BackendDoseLog>(`/dose-logs/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },

  /** DELETE /dose-logs/{id} */
  async remove(id: string): Promise<BackendDoseLog> {
    return apiFetch<BackendDoseLog>(`/dose-logs/${id}`, {
      method: 'DELETE',
    });
  },
};
