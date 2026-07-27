---
inclusion: always
---

# GuardiánSalud — Modelos de Datos

## API REST (backend real)

**Base URL:** `https://guardian-salud-dev.onrender.com`  
**Auth:** Bearer JWT — header `Authorization: Bearer <token>`  
**Cliente:** `src/lib/api.ts` → `apiFetch<T>(path, options)`  
**Token storage:** `localStorage['guardiansalud_token']`

### Endpoints disponibles

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/auth/login` | ❌ | Login → `{ access_token: string }` |
| GET | `/auth/me` | ✅ | Usuario autenticado → `BackendUser` |
| GET | `/users` | ✅ | Lista todos los usuarios |
| POST | `/users` | ✅ | Crear usuario → `BackendUser` |
| GET | `/users/{id}` | ✅ | Obtener usuario por UUID |
| PATCH | `/users/{id}` | ✅ | Actualizar usuario parcialmente |
| DELETE | `/users/{id}` | ✅ | Eliminar usuario |

### `BackendUser` (UserResponseDto)

```ts
interface BackendUser {
  id: string;        // UUID
  full_name: string; // Nombre completo
  email: string;
  role: BackendRole; // 'ADMIN' | 'PHYSICIAN' | 'NURSE'
  is_active: boolean;
}
```

### `CreateUserDto`

```ts
interface CreateUserDto {
  full_name: string;  // requerido
  email: string;      // requerido
  password: string;   // requerido
  role: BackendRole;  // requerido: 'ADMIN' | 'PHYSICIAN' | 'NURSE'
  is_active?: boolean; // opcional, default true
}
```

### Mapeo de roles backend → frontend

| Backend (`BackendRole`) | Frontend (`Role`) | Label UI |
|------------------------|-------------------|----------|
| `ADMIN` | `admin` | Administrador |
| `PHYSICIAN` | `medico` | Médico |
| `NURSE` | `enfermero` | Enfermero / Cuidador |

Conversión en `src/types.ts`:
```ts
BACKEND_ROLE_MAP = { ADMIN: 'admin', PHYSICIAN: 'medico', NURSE: 'enfermero' }
FRONTEND_ROLE_MAP = { admin: 'ADMIN', medico: 'PHYSICIAN', enfermero: 'NURSE' }
backendUserToAuthUser(u: BackendUser): AuthUser  // helper de conversión
```

### `AuthUser` (sesión activa en el contexto)

```ts
interface AuthUser {
  id: string;       // UUID del backend
  nombre: string;   // full_name del backend
  email: string;
  role: Role;       // ya convertido al rol interno del frontend
  isActive: boolean;
}
```

Persistencia: `localStorage['guardiansalud_session']` como JSON.

### Flujo de autenticación

```
login(email, password)
  → POST /auth/login → { access_token }
  → setToken(access_token)  [localStorage['guardiansalud_token']]
  → GET /auth/me → BackendUser
  → backendUserToAuthUser() → AuthUser
  → setUser(authUser) + persist session
  → setActiveTab(ROLE_TABS[authUser.role][0])

Al recargar página:
  → getToken() → si hay token → GET /auth/me → restaurar sesión
  → si falla (token expirado) → clearToken() + logout silencioso

logout()
  → clearToken()
  → removeItem(SESSION_KEY)
  → setUser(null)
```

---

Todos los tipos están definidos en `src/types.ts`. Los datos semilla y constantes de opciones están en `src/data.ts`.

## Entidades principales

### `Medicamento`
Catálogo de medicamentos e insumos del establecimiento.

```ts
interface Medicamento {
  id: string;               // genId('med') → 'med-1001'
  nombre: string;           // Nombre comercial, ej. "Insulina NPH"
  formula: string;          // Principio activo, ej. "Insulina isofana"
  concentracion: string;    // ej. "100 UI/mL" o "500 mg"
  presentacion: Presentacion; // 'Caja' | 'Frasco' | 'Blíster' | 'Ampolleta' | 'Jarabe'
  via: ViaAdmin;            // 'Oral' | 'Subcutánea/Intramuscular' | 'Tópica' | 'Oftálmica' | 'Inhalada'
  stock: number;            // Unidades disponibles en inventario
  createdAt: string;        // ISO 8601
}
```

**Stock semáforo:** `stock <= 5` → rojo (crítico), `stock <= 15` → amarillo (bajo), resto → verde.

---

### `Residente`
Perfil operativo de cada paciente/residente. **Sin nombre real** — Privacy by Design.

```ts
interface Residente {
  id: string;          // genId('res') → 'res-1001'
  apodo: string;       // Identificador: apodo o código, ej. "Abuelo Beto" o "RES-014"
  habitacion: string;  // Ubicación física, ej. "Mueble 12 - Cama A"
  condicion: string;   // Padecimiento principal, ej. "Diabetes Tipo 2 + Hipertensión"
  dieta: string;       // Tipo de dieta, ej. "Diabética/Hiposódica"
  alergias: string;    // ⚠️ CAMPO CRÍTICO: alergias y medicamentos prohibidos, ej. "Penicilina, AINEs"
  cuidados: string;    // Notas de cuidado especial
  createdAt: string;
}
```

> **Regla de negocio:** Si `alergias` no contiene "ninguna", la `TabDosis` mostrará advertencia y el motor de validación revisará coincidencias con el medicamento seleccionado.

---

### `Personal`
Colaboradores del establecimiento (enfermeros, cuidadores, médicos, auxiliares).

```ts
interface Personal {
  id: string;               // genId('per') → 'per-1001'
  nombre: string;           // Nombre completo
  rol: RolPersonal;         // 'Enfermero(a)' | 'Cuidador(a)' | 'Médico' | 'Auxiliar'
  especialidades: string[]; // Subset de ESPECIALIDADES_DISPONIBLES
  turnoPref: TurnoTipo;     // 'Matutino' | 'Vespertino' | 'Nocturno' | 'Planta'
  createdAt: string;
}
```

---

### `AsignacionTurno`
Asigna a un miembro del personal a un turno, zona y fecha específicos.

```ts
interface AsignacionTurno {
  id: string;        // genId('asg')
  personalId: string; // FK → Personal.id
  turno: TurnoTipo;
  zona: string;      // ej. "Muebles 10-14"
  fecha: string;     // YYYY-MM-DD
}
```

**Horarios por turno:**
- Matutino: 06:00 – 14:00
- Vespertino: 14:00 – 22:00
- Nocturno: 22:00 – 06:00
- Planta: 24 hrs (rotación)

---

### `Dosis`
Prescripción de un medicamento a un residente con frecuencia y responsable asignado.

```ts
interface Dosis {
  id: string;               // genId('dos')
  residenteId: string;      // FK → Residente.id
  medicamentoId: string;    // FK → Medicamento.id
  frecuencia: string;       // 'Cada 4 hrs' | 'Cada 6 hrs' | 'Cada 8 hrs' | 'Cada 12 hrs' | 'Cada 24 hrs' | 'Única dosis'
  horaInicio: string;       // HH:MM, ej. "07:00"
  cuidadorId: string;       // FK → Personal.id (responsable de aplicar)
  altaCriticidad: boolean;  // true = requiere confirmación obligatoria en Agenda
  estado: EstadoDosis;      // 'pendiente' | 'aplicada' | 'no-aplicada'
  horaAplicada?: string;    // HH:MM — se llena al confirmar en Agenda
  aplicadaPor?: string;     // Nombre del cuidador que confirmó
  motivoOmision?: string;   // Texto libre — obligatorio si estado = 'no-aplicada'
  createdAt: string;
}
```

**Regla de negocio:** No se puede crear una `Dosis` si el medicamento contiene un componente al que el residente es alérgico (validación en `TabDosis` con `allergyBlock`).

---

### `BitacoraEntry`
Registro inmutable de auditoría. Se genera automáticamente al aplicar o no aplicar una dosis.

```ts
interface BitacoraEntry {
  id: string;            // genId('bit')
  fecha: string;         // YYYY-MM-DD
  residenteId: string;   // FK → Residente.id
  medicamentoId: string; // FK → Medicamento.id
  cuidadorId: string;    // FK → Personal.id
  estado: EstadoDosis;   // 'aplicada' | 'no-aplicada'
  hora: string;          // HH:MM del evento
  nota?: string;         // Observación clínica opcional (ej. "Glucemia 145 mg/dL")
}
```

> La bitácora **nunca se edita ni elimina** — es trazabilidad de auditoría.

---

### `AuthUser`
Usuario autenticado en sesión activa. Persiste en `localStorage`.

```ts
interface AuthUser {
  nombre: string;
  email: string;
  role: Role; // 'admin' | 'medico' | 'enfermero'
}
```

---

## Relaciones entre entidades

```
Personal ──────────────────────────────┐
   │                                   │
   │ (cuidadorId)              (personalId)
   ▼                                   ▼
 Dosis ──────────────────────── AsignacionTurno
   │  (residenteId)  (medicamentoId)
   ▼                     ▼
Residente          Medicamento
   │
   └──── (residenteId, medicamentoId, cuidadorId)
              ▼
         BitacoraEntry
```

---

## Constantes de opciones (src/data.ts)

```ts
PRESENTACIONES = ['Caja', 'Frasco', 'Blíster', 'Ampolleta', 'Jarabe']
VIAS           = ['Oral', 'Subcutánea/Intramuscular', 'Tópica', 'Oftálmica', 'Inhalada']
CONDICIONES    = ['Diabetes Tipo 2', 'Hipertensión arterial', 'Glaucoma bilateral', ...]
DIETAS         = ['Sólida regular', 'Blanda', 'Diabética/Hiposódica', 'Líquida completa', ...]
ROLES          = ['Enfermero(a)', 'Cuidador(a)', 'Médico', 'Auxiliar']
TURNOS         = ['Matutino', 'Vespertino', 'Nocturno', 'Planta']
FRECUENCIAS    = ['Cada 4 hrs', 'Cada 6 hrs', 'Cada 8 hrs', 'Cada 12 hrs', 'Cada 24 hrs', 'Única dosis']
ESPECIALIDADES_DISPONIBLES = ['Inyectología', 'Toma de Signos Vitales', 'Paciente Crítico', 'Curaciones', 'Reanimación']
```

---

## Plan de migración a Supabase

Al conectar la base de datos, cada entidad se mapeará a una tabla Supabase con las siguientes consideraciones:

| Entidad local | Tabla Supabase | Notas |
|---|---|---|
| `Medicamento` | `medicamentos` | RLS por `establecimiento_id` |
| `Residente` | `residentes` | RLS por `establecimiento_id`; campo `alergias` encriptado |
| `Personal` | `personal` | RLS por `establecimiento_id` |
| `AsignacionTurno` | `asignaciones_turno` | RLS por `personal_id` o rol |
| `Dosis` | `dosis` | RLS: médico ve todo, enfermero solo su `cuidador_id` |
| `BitacoraEntry` | `bitacora` | Solo INSERT, nunca UPDATE/DELETE — append-only |
| `AuthUser` | `auth.users` (Supabase Auth) | Metadata: `role`, `nombre` en `user_metadata` |

Los `genId()` se reemplazarán por `crypto.randomUUID()` o el UUID autogenerado de Postgres.
