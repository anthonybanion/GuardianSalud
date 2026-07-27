/**
 * Servicio de usuarios
 *
 * Endpoints:
 *  POST   /users           → UserResponseDto  (crear usuario)
 *  GET    /users           → UserResponseDto[]
 *  GET    /users/{id}      → UserResponseDto
 *  PATCH  /users/{id}      → UserResponseDto  (actualizar parcialmente)
 *  DELETE /users/{id}      → UserResponseDto  (eliminar)
 */

import { apiFetch } from './api';
import type { BackendUser, BackendRole } from '@/types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateUserDto {
  full_name: string;
  email: string;
  password: string;
  role: BackendRole;
  is_active?: boolean;
}

export interface UpdateUserDto {
  full_name?: string;
  email?: string;
  password?: string;
  role?: BackendRole;
  is_active?: boolean;
}

// ─── usersService ─────────────────────────────────────────────────────────────

export const usersService = {
  /** GET /users — lista todos los usuarios */
  async getAll(): Promise<BackendUser[]> {
    return apiFetch<BackendUser[]>('/users');
  },

  /** GET /users/{id} — obtiene un usuario por su UUID */
  async getById(id: string): Promise<BackendUser> {
    return apiFetch<BackendUser>(`/users/${id}`);
  },

  /** POST /users — crea un nuevo usuario */
  async create(dto: CreateUserDto): Promise<BackendUser> {
    return apiFetch<BackendUser>('/users', {
      method: 'POST',
      body: dto,
    });
  },

  /** PATCH /users/{id} — actualiza campos parciales de un usuario */
  async update(id: string, dto: UpdateUserDto): Promise<BackendUser> {
    return apiFetch<BackendUser>(`/users/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  },

  /** DELETE /users/{id} — elimina un usuario */
  async remove(id: string): Promise<BackendUser> {
    return apiFetch<BackendUser>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
