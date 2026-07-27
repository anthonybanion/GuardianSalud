// ─── Tema ─────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

// ─── Navegación ───────────────────────────────────────────────────────────────

export type MainTab = 'registros' | 'turnos' | 'dosis' | 'agenda' | 'bitacora';

// ─── Roles ────────────────────────────────────────────────────────────────────

/**
 * Roles tal como los devuelve el backend.
 * ADMIN → admin  |  PHYSICIAN → medico  |  NURSE → enfermero
 */
export type BackendRole = 'ADMIN' | 'PHYSICIAN' | 'NURSE';

/** Roles internos del frontend (usados en navegación, labels, etc.) */
export type Role = 'admin' | 'medico' | 'enfermero';

/** Mapa de conversión backend → frontend */
export const BACKEND_ROLE_MAP: Record<BackendRole, Role> = {
  ADMIN: 'admin',
  PHYSICIAN: 'medico',
  NURSE: 'enfermero',
};

/** Mapa inverso frontend → backend */
export const FRONTEND_ROLE_MAP: Record<Role, BackendRole> = {
  admin: 'ADMIN',
  medico: 'PHYSICIAN',
  enfermero: 'NURSE',
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  enfermero: 'Enfermero / Cuidador',
};

export const ROLE_TABS: Record<Role, MainTab[]> = {
  admin: ['registros', 'turnos', 'dosis', 'agenda', 'bitacora'],
  medico: ['turnos', 'dosis', 'bitacora'],
  enfermero: ['agenda'],
};

// ─── Tipos del backend (UserResponseDto) ─────────────────────────────────────

/**
 * Usuario tal como lo devuelve la API en /auth/me y /users.
 * Mapea directamente a UserResponseDto del OpenAPI.
 */
export interface BackendUser {
  id: string;
  full_name: string;
  email: string;
  role: BackendRole;
  is_active: boolean;
}

// ─── Usuario autenticado (sesión activa) ──────────────────────────────────────

/**
 * Usuario que vive en el contexto de la app.
 * Se construye a partir de BackendUser convirtiendo el role al formato interno.
 */
export interface AuthUser {
  id: string;
  nombre: string;   // ← full_name del backend
  email: string;
  role: Role;       // ← convertido desde BackendRole
  isActive: boolean;
}

/** Convierte un BackendUser en el AuthUser que usa el frontend */
export function backendUserToAuthUser(u: BackendUser): AuthUser {
  return {
    id: u.id,
    nombre: u.full_name,
    email: u.email,
    role: BACKEND_ROLE_MAP[u.role],
    isActive: u.is_active,
  };
}

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────

export type SubTabRegistros = 'medicamentos' | 'residentes' | 'personal';

// ─── Dominio clínico ──────────────────────────────────────────────────────────

export type Presentacion = 'Caja' | 'Frasco' | 'Blíster' | 'Ampolleta' | 'Jarabe';
export type ViaAdmin = 'Oral' | 'Subcutánea/Intramuscular' | 'Tópica' | 'Oftálmica' | 'Inhalada';

export interface Medicamento {
  id: string;
  nombre: string;
  formula: string;
  concentracion: string;
  presentacion: Presentacion;
  via: ViaAdmin;
  stock: number;
  createdAt: string;
}

export interface Residente {
  id: string;
  apodo: string;
  habitacion: string;
  condicion: string;
  dieta: string;
  alergias: string;
  cuidados: string;
  createdAt: string;
}

export type RolPersonal = 'Enfermero(a)' | 'Cuidador(a)' | 'Médico' | 'Auxiliar';
export type TurnoTipo = 'Matutino' | 'Vespertino' | 'Nocturno' | 'Planta';

export interface Personal {
  id: string;
  nombre: string;
  rol: RolPersonal;
  especialidades: string[];
  turnoPref: TurnoTipo;
  createdAt: string;
}

export interface AsignacionTurno {
  id: string;
  personalId: string;
  turno: TurnoTipo;
  zona: string;
  fecha: string;
}

export type EstadoDosis = 'pendiente' | 'aplicada' | 'no-aplicada';

export interface Dosis {
  id: string;
  residenteId: string;
  medicamentoId: string;
  frecuencia: string;
  horaInicio: string;
  cuidadorId: string;
  altaCriticidad: boolean;
  estado: EstadoDosis;
  horaAplicada?: string;
  aplicadaPor?: string;
  motivoOmision?: string;
  createdAt: string;
}

export interface BitacoraEntry {
  id: string;
  fecha: string;
  residenteId: string;
  medicamentoId: string;
  cuidadorId: string;
  estado: EstadoDosis;
  hora: string;
  nota?: string;
}
