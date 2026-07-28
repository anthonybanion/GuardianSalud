/**
 * Servicio de Staff (Personal / Cuidadores)
 *
 * Endpoints:
 *  POST   /staff           → StaffEntity  (crear)
 *  GET    /staff           → StaffEntity[]
 *  GET    /staff/{id}      → StaffEntity
 *  PATCH  /staff/{id}      → StaffEntity
 *  DELETE /staff/{id}      → StaffEntity
 *
 * Nota: El backend maneja staff como un perfil extendido de un User.
 * Para crear staff primero debe existir un User con rol NURSE o PHYSICIAN.
 * El campo user_id es el UUID del User ya creado.
 */

import { apiFetch } from './api';
import type { BackendStaff, CreateStaffDto, UpdateStaffDto } from '@/types';

export const staffService = {
  /** GET /staff — lista todo el personal */
  async getAll(): Promise<BackendStaff[]> {
    return apiFetch<BackendStaff[]>('/staff');
  },

  /** GET /staff/{id} */
  async getById(id: string): Promise<BackendStaff> {
    return apiFetch<BackendStaff>(`/staff/${id}`);
  },

  /** POST /staff — crea un perfil de staff para un user_id existente */
  async create(dto: CreateStaffDto): Promise<BackendStaff> {
    return apiFetch<BackendStaff>('/staff', {
      method: 'POST',
      body: dto,
    });
  },

  /** PATCH /staff/{id} — actualiza especialidades o turno preferido */
  async update(id: string, dto: UpdateStaffDto): Promise<BackendStaff> {
    return apiFetch<BackendStaff>(`/staff/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },

  /** DELETE /staff/{id} */
  async remove(id: string): Promise<BackendStaff> {
    return apiFetch<BackendStaff>(`/staff/${id}`, {
      method: 'DELETE',
    });
  },
};
