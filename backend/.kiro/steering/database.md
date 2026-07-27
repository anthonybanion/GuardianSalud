# Guardián Salud - Diseño de Base de Datos

## Motor y ORM

- Base de datos: PostgreSQL.
- ORM: Prisma.
- El schema de Prisma usa camelCase.
- Las columnas físicas de PostgreSQL usan snake_case mediante `@map`.

Ejemplo:

```prisma
userId String @map("user_id")
preferredShift ShiftType? @map("preferred_shift")
```

Reglas:
- Tablas en plural.
- Campos en inglés.
- Columnas SQL en snake_case.
- Clave primaria estándar: `id`.
- Claves foráneas: `<entidad>Id` en Prisma y `<tabla>_id` en PostgreSQL.
- IDs con UUID.

---

# Enums

## Role

Roles disponibles del sistema:

```text
ADMIN
PHYSICIAN
NURSE
```

### ADMIN

Acceso completo:

- Usuarios.
- Personal.
- Residentes.
- Medicamentos.
- Turnos.
- Tratamientos.
- Bitácora.
- Configuración general.

### PHYSICIAN

Responsable de planificación clínica.

Puede:

- Consultar personal de enfermería.
- Consultar turnos.
- Crear tratamientos.
- Asignar medicamentos.
- Definir dosis y frecuencia.
- Consultar bitácora.
- Consultar residentes.

No puede:

- Administrar usuarios.
- Administrar catálogo de medicamentos.

### NURSE

Responsable de ejecutar tratamientos.

Puede:

- Consultar agenda propia.
- Ver dosis asignadas.
- Registrar dosis aplicada.
- Registrar omisiones.
- Consultar instrucciones de IA.
- Consultar información necesaria del residente.

No puede:

- Modificar tratamientos.
- Asignar medicamentos.

---

# ShiftType

```text
MORNING
AFTERNOON
NIGHT
```

Representa los turnos laborales.

---

# DoseStatus

```text
PENDING
APPLIED
OMITTED
```

Estados posibles de una dosis.

---

# Tablas principales

## users

Autenticación y autorización.

Responsabilidades:

- Login.
- Registro.
- Gestión de usuarios.
- Control de roles.

Campos:

| Campo | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| fullName | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE NOT NULL |
| passwordHash | VARCHAR(255) | NOT NULL |
| role | Role | NOT NULL |
| isActive | BOOLEAN | DEFAULT TRUE |

Notas:

- passwordHash nunca debe exponerse en respuestas API.
- email es único para autenticación.

---

# staff

Información profesional del personal clínico.

Relaciona un usuario con información profesional.

Campos:

| Campo | Tipo | Restricción |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK users.id UNIQUE |
| specialties | TEXT | NULL |
| preferredShift | ShiftType | NULL |

Relación:

```
users 1 ---- 0..1 staff
```

Reglas:

- Un usuario puede tener máximo un registro staff.
- Médicos y enfermeros usan esta tabla.
- El rol viene desde users.role.

---

# residents

Información interna de residentes.

No almacenar datos personales sensibles.

Campos:

| Campo | Tipo |
|---|---|
| id | UUID |
| nickname | VARCHAR(100) |
| roomLocation | VARCHAR(50) |
| medicalCondition | VARCHAR(150) |
| diet | VARCHAR(100) |
| allergies | TEXT |
| specialCare | TEXT |

Uso:

- Identificación interna.
- Información necesaria para cuidados.

---

# medications

Catálogo de medicamentos.

Campos:

| Campo | Tipo |
|---|---|
| id | UUID |
| commercialName | VARCHAR(100) |
| activeIngredient | VARCHAR(100) |
| concentration | VARCHAR(50) |
| presentation | VARCHAR(50) |
| administrationRoute | VARCHAR(50) |
| currentStock | INT |
| minimumStock | INT |

Reglas:

- Control de stock.
- Catálogo independiente de tratamientos.

---

# shift_assignments

Asignación de turnos del personal.

Campos:

| Campo | Tipo |
|---|---|
| id | UUID |
| staffId | UUID |
| shiftType | ShiftType |
| shiftDate | DATE |
| assignedArea | VARCHAR(100) |

Relación:

```
staff 1 ---- N shift_assignments
```

---

# treatment_assignments

Define tratamientos médicos.

Relaciona:

- Residente.
- Medicamento.
- Médico que prescribe.
- Enfermero responsable.

Campos:

| Campo | Tipo |
|---|---|
| id | UUID |
| residentId | UUID |
| medicationId | UUID |
| prescribedBy | UUID staff |
| assignedStaffId | UUID staff |
| prescribedDose | VARCHAR(50) |
| frequencyHours | INT |
| startTime | TIME |
| isCritical | BOOLEAN |
| aiInstructions | TEXT |
| isTemporary | BOOLEAN |

Relaciones:

```
residents 1 ---- N treatment_assignments

medications 1 ---- N treatment_assignments

staff(PHYSICIAN) 1 ---- N treatment_assignments

staff(NURSE) 1 ---- N treatment_assignments
```

Reglas:

- prescribedBy debe corresponder a un PHYSICIAN.
- assignedStaffId debe corresponder a un NURSE.

---

# dose_logs

Bitácora de administración.

Registra cada dosis.

Campos:

| Campo | Tipo |
|---|---|
| id | UUID |
| treatmentId | UUID |
| residentId | UUID |
| staffId | UUID |
| scheduledAt | TIMESTAMP |
| administeredAt | TIMESTAMP |
| status | DoseStatus |
| omissionReason | TEXT |

Relaciones:

```
treatment_assignments 1 ---- N dose_logs

residents 1 ---- N dose_logs

staff 1 ---- N dose_logs
```

Reglas:

- Registrar quién administra la medicación.
- Registrar fecha programada.
- Registrar fecha real.
- Registrar motivo si fue omitida.

---

# Relaciones generales

```
users
 |
 | 1 : 0..1
 |
staff
 |
 | 1 : N
 |
shift_assignments


residents
 |
 | 1 : N
 |
treatment_assignments
 |
 | 1 : N
 |
dose_logs


medications
 |
 | 1 : N
 |
treatment_assignments
```

---

# Reglas para Backend

- La lógica de permisos pertenece al backend.
- Los roles se validan mediante Guards.
- Repository solo accede a Prisma.
- Service contiene reglas de negocio.
- Controller maneja HTTP.
- DTO valida entrada.
- Entity representa respuestas API.
- Nunca devolver passwordHash.
- Validar relaciones antes de crear registros dependientes.