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

// ─── Residents (backend) ──────────────────────────────────────────────────────

export interface BackendResident {
  id: string;
  nickname: string;              // apodo/nombre
  room_location?: string;
  medical_condition?: string;
  diet?: string;
  allergies?: string;
  special_care?: string;
}

export interface CreateResidentDto {
  nickname: string;              // requerido
  room_location: string;         // requerido
  medical_condition?: string;
  diet?: string;
  allergies?: string;
  special_care?: string;
}

export interface UpdateResidentDto {
  nickname?: string;
  room_location?: string;
  medical_condition?: string;
  diet?: string;
  allergies?: string;
  special_care?: string;
}

// ─── Shift Assignments (backend) — Cuidadores y Turnos ───────────────────────

/**
 * Turno igual que en Staff — reutiliza BackendShift:
 * MORNING → Matutino | AFTERNOON → Vespertino | NIGHT → Nocturno
 */

export interface BackendShiftAssignment {
  id: string;
  staff_id: string;           // UUID del staff asignado
  shift_type: BackendShift;   // 'MORNING' | 'AFTERNOON' | 'NIGHT'
  shift_date: string;         // YYYY-MM-DD
  assigned_area?: string;     // ej. "Pabellón Norte"
  staff?: BackendStaff;       // relación anidada (si el backend la incluye)
}

export interface CreateShiftAssignmentDto {
  staff_id: string;           // requerido
  shift_type: BackendShift;   // requerido
  shift_date: string;         // requerido — YYYY-MM-DD
  assigned_area?: string;     // opcional
}

export interface UpdateShiftAssignmentDto {
  shift_type?: BackendShift;
  shift_date?: string;
  assigned_area?: string;
}

// ─── Treatments (backend) — Asignación de Dosis ──────────────────────────────

/**
 * Tratamiento tal como lo devuelve la API en /treatments.
 * Mapea directamente a TreatmentEntity del OpenAPI.
 */
export interface BackendTreatment {
  id: string;
  resident_id: string;         // UUID del residente
  medication_id: string;       // UUID del medicamento
  prescribed_by: string;       // UUID del médico que prescribe
  assigned_staff_id: string;   // UUID del staff (enfermero asignado)
  prescribed_dose: string;     // ej. "500mg cada 8 horas"
  frequency_hours: number;     // frecuencia en horas, ej. 8
  start_time: string;          // HH:mm — hora de inicio, ej. "08:00"
  is_critical?: boolean;       // si requiere confirmación obligatoria
  ai_instructions?: string;    // instrucciones generadas por IA
  is_temporary?: boolean;      // si es un tratamiento temporal
}

export interface CreateTreatmentDto {
  resident_id: string;         // requerido
  medication_id: string;       // requerido
  prescribed_by: string;       // requerido — UUID del médico (user.id)
  assigned_staff_id: string;   // requerido — UUID del staff
  prescribed_dose: string;     // requerido — texto libre, ej. "500mg"
  frequency_hours: number;     // requerido — número de horas
  start_time: string;          // requerido — HH:mm
  is_critical?: boolean;
  ai_instructions?: string;
  is_temporary?: boolean;
}

export interface UpdateTreatmentDto {
  assigned_staff_id?: string;
  prescribed_dose?: string;
  frequency_hours?: number;
  start_time?: string;
  is_critical?: boolean;
  ai_instructions?: string;
  is_temporary?: boolean;
}

// ─── Dose Logs (backend) — Bitácora ──────────────────────────────────────────

/**
 * Estado de una dosis tal como lo maneja el backend.
 */
export type BackendDoseStatus = 'PENDING' | 'APPLIED' | 'OMITTED';

/** Mapa backend → label UI en español */
export const DOSE_STATUS_LABEL: Record<BackendDoseStatus, string> = {
  PENDING:  'Pendiente',
  APPLIED:  'Aplicada',
  OMITTED:  'Omitida',
};

/**
 * Entrada de bitácora tal como la devuelve la API en /dose-logs.
 * Mapea directamente a DoseLogEntity del OpenAPI.
 */
export interface BackendDoseLog {
  id: string;
  treatment_id: string;         // UUID del tratamiento
  resident_id: string;          // UUID del residente
  staff_id: string;             // UUID del staff que administra
  scheduled_at: string;         // ISO 8601 — fecha/hora programada
  administered_at?: string;     // ISO 8601 — fecha/hora real (si fue APPLIED)
  status: BackendDoseStatus;
  omission_reason?: string;     // Motivo de omisión (si status = OMITTED)
}

export interface CreateDoseLogDto {
  treatment_id: string;         // requerido
  resident_id: string;          // requerido
  staff_id: string;             // requerido
  scheduled_at: string;         // requerido — ISO 8601
  status: BackendDoseStatus;    // requerido
  administered_at?: string;     // ISO 8601
  omission_reason?: string;
}

export interface UpdateDoseLogDto {
  staff_id?: string;
  scheduled_at?: string;
  administered_at?: string;
  status?: BackendDoseStatus;
  omission_reason?: string;
}

// ─── Medications (backend) ────────────────────────────────────────────────────

/**
 * Medicamento tal como lo devuelve la API en /medications.
 * Mapea directamente a MedicationEntity del OpenAPI.
 */
export interface BackendMedication {
  id: string;
  commercial_name: string;       // Nombre comercial
  active_ingredient?: string;    // Principio activo
  concentration?: string;        // ej. "500mg"
  presentation?: string;         // ej. "Tableta"
  administration_route: string;  // Vía de administración
  current_stock?: number;        // Stock actual
  minimum_stock?: number;        // Stock mínimo requerido
}

export interface CreateMedicationDto {
  commercial_name: string;       // requerido
  administration_route: string;  // requerido
  active_ingredient?: string;
  concentration?: string;
  presentation?: string;
  current_stock?: number;
  minimum_stock?: number;
}

export interface UpdateMedicationDto {
  commercial_name?: string;
  administration_route?: string;
  active_ingredient?: string;
  concentration?: string;
  presentation?: string;
  current_stock?: number;
  minimum_stock?: number;
}

// ─── Staff (backend) ─────────────────────────────────────────────────────────

/**
 * Turno tal como lo maneja el backend.
 * MORNING → Matutino | AFTERNOON → Vespertino | NIGHT → Nocturno
 */
export type BackendShift = 'MORNING' | 'AFTERNOON' | 'NIGHT';

/** Mapa backend → label UI en español */
export const BACKEND_SHIFT_LABEL: Record<BackendShift, string> = {
  MORNING: 'Matutino',
  AFTERNOON: 'Vespertino',
  NIGHT: 'Nocturno',
};

/** Mapa label UI → backend */
export const SHIFT_TO_BACKEND: Record<string, BackendShift> = {
  Matutino: 'MORNING',
  Vespertino: 'AFTERNOON',
  Nocturno: 'NIGHT',
};

/**
 * Perfil de Staff tal como lo devuelve la API en /staff.
 * El backend devuelve una entidad con relación al User.
 */
export interface BackendStaff {
  id: string;                      // UUID del staff
  user_id: string;                 // UUID del User asociado
  specialties?: string;            // "Cardiología, Medicina interna" (texto libre)
  preferred_shift?: BackendShift;  // 'MORNING' | 'AFTERNOON' | 'NIGHT'
  user?: BackendUser;              // relación anidada (si el backend la incluye)
}

export interface CreateStaffDto {
  user_id: string;               // requerido — UUID del User existente
  specialties?: string;          // opcional — texto libre separado por comas
  preferred_shift?: BackendShift; // opcional
}

export interface UpdateStaffDto {
  specialties?: string;
  preferred_shift?: BackendShift;
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
