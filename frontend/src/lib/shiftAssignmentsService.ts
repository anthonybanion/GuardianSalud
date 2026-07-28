/**
 * Servicio de Shift Assignments (Asignaciones de Turno)
 *
 * Endpoints:
 *  POST   /shift-assignments        → ShiftAssignmentEntity
 *  GET    /shift-assignments        → ShiftAssignmentEntity[]
 *  GET    /shift-assignments/{id}   → ShiftAssignmentEntity
 *  PATCH  /shift-assignments/{id}   → ShiftAssignmentEntity
 *  DELETE /shift-assignments/{id}   → ShiftAssignmentEntity
 */

import { apiFetch } from './api';
import type {
  BackendShiftAssignment,
  CreateShiftAssignmentDto,
  UpdateShiftAssignmentDto,
} from '@/types';

export const shiftAssignmentsService = {
  /** GET /shift-assignments */
  async getAll(): Promise<BackendShiftAssignment[]> {
    return apiFetch<BackendShiftAssignment[]>('/shift-assignments');
  },

  /** GET /shift-assignments/{id} */
  async getById(id: string): Promise<BackendShiftAssignment> {
    return apiFetch<BackendShiftAssignment>(`/shift-assignments/${id}`);
  },

  /** POST /shift-assignments */
  async create(dto: CreateShiftAssignmentDto): Promise<BackendShiftAssignment> {
    return apiFetch<BackendShiftAssignment>('/shift-assignments', {
      method: 'POST',
      body: dto,
    });
  },

  /** PATCH /shift-assignments/{id} */
  async update(
    id: string,
    dto: UpdateShiftAssignmentDto,
  ): Promise<BackendShiftAssignment> {
    return apiFetch<BackendShiftAssignment>(`/shift-assignments/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },

  /** DELETE /shift-assignments/{id} */
  async remove(id: string): Promise<BackendShiftAssignment> {
    return apiFetch<BackendShiftAssignment>(`/shift-assignments/${id}`, {
      method: 'DELETE',
    });
  },
};
