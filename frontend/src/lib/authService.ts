/**
 * Servicio de autenticación
 *
 * Endpoints:
 *  POST /auth/login  → { access_token: string }
 *  GET  /auth/me     → UserResponseDto  (requiere Bearer)
 */

import { apiFetch, setToken, clearToken } from './api';
import type { BackendUser } from '@/types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

// ─── authService ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Llama a POST /auth/login, guarda el JWT y devuelve el usuario completo
   * obtenido de GET /auth/me.
   */
  async login(credentials: LoginDto): Promise<BackendUser> {
    const { access_token } = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: credentials,
      auth: false, // login no lleva Authorization header
    });

    // Guardar token antes de llamar a /auth/me
    setToken(access_token);

    // Obtener perfil completo del usuario
    const user = await authService.me();
    return user;
  },

  /**
   * GET /auth/me — devuelve el usuario autenticado según el JWT actual.
   * Lanza ApiError 401 si el token no es válido o no existe.
   */
  async me(): Promise<BackendUser> {
    return apiFetch<BackendUser>('/auth/me');
  },

  /**
   * Limpia el JWT del localStorage. No tiene endpoint de logout en la API.
   */
  logout(): void {
    clearToken();
  },
};
