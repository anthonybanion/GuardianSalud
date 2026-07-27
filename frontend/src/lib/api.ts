/**
 * Cliente base de la API de GuardiánSalud
 * Base URL: https://guardian-salud-dev.onrender.com
 *
 * Maneja:
 *  - Inyección automática del Bearer token desde localStorage
 *  - Respuestas de error normalizadas como ApiError
 *  - Tipos genéricos para todas las respuestas
 */

export const API_BASE_URL = 'https://guardian-salud-dev.onrender.com';

const TOKEN_KEY = 'guardiansalud_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Error tipado ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Si es false, no agrega el header Authorization (ej. login) */
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Intentar parsear el cuerpo siempre (puede tener info de error útil)
  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    // El backend devuelve mensajes de error en distintos formatos
    const message =
      (responseBody as { message?: string })?.message ??
      `Error ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, message, responseBody);
  }

  return responseBody as T;
}
