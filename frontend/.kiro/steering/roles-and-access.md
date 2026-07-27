---
inclusion: always
---

# GuardiánSalud — Roles y Control de Acceso

## Roles del Sistema

El sistema tiene 3 roles definidos en `src/types.ts`:

| Rol | Constante | Descripción |
|-----|-----------|-------------|
| Administrador | `'admin'` | Acceso total. Gestiona catálogos, turnos, dosis y auditoría |
| Médico | `'medico'` | Prescribe dosis, gestiona turnos, consulta bitácora. No gestiona catálogos base |
| Enfermero / Cuidador | `'enfermero'` | Solo ejecuta su agenda del turno — confirma o registra omisiones |

---

## Acceso por Tab (ROLE_TABS)

Definido en `src/types.ts` como `ROLE_TABS: Record<Role, MainTab[]>`:

```ts
ROLE_TABS = {
  admin:     ['registros', 'turnos', 'dosis', 'agenda', 'bitacora'],
  medico:    ['turnos', 'dosis', 'bitacora'],
  enfermero: ['agenda'],
}
```

| Tab | Admin | Médico | Enfermero |
|-----|:-----:|:------:|:---------:|
| Registros Base | ✅ | ❌ | ❌ |
| Cuidadores y Turnos | ✅ | ✅ | ❌ |
| Asignar Dosis | ✅ | ✅ | ❌ |
| Agenda del Turno | ✅ | ✅ | ✅ |
| Bitácora de Auditoría | ✅ | ✅ | ❌ |

> **Regla de implementación:** El `Header` solo renderiza las tabs de `allowedTabs`. No existe navegación directa por URL — la protección es a nivel del estado de la app. Al integrar rutas reales, agregar guards de ruta.

---

## Lógica de Autenticación Actual (Demo)

El login es simulado — no hay verificación real de contraseña:

1. Si el email coincide con un `DEMO_USERS`, se asigna ese rol y nombre
2. Si no coincide, se asigna rol `admin` por defecto con el prefijo del email como nombre
3. La sesión se guarda en `localStorage` bajo `guardiansalud_session`
4. El tema se guarda en `localStorage` bajo `guardiansalud_theme`

**Usuarios demo disponibles:**
| Email | Rol | Nombre |
|-------|-----|--------|
| `admin@guardiansalud.app` | admin | Diego Pérez |
| `medico@guardiansalud.app` | medico | Dr. Luis Ramírez |
| `enfermero@guardiansalud.app` | enfermero | Ana Torres |

---

## Comportamiento por Rol en la App

### Admin
- Accede a `TabRegistros` con sub-tabs: Medicamentos, Residentes, Personal
- Puede crear medicamentos, registrar residentes, dar de alta personal
- Puede asignar turnos y programar dosis
- Puede consultar la bitácora completa con filtros
- Primera tab al hacer login: `registros`

### Médico
- No ve `TabRegistros` — no puede modificar catálogos base
- Puede asignar turnos al personal
- Puede programar dosis (con validación de alergias)
- Puede consultar bitácora completa
- Primera tab al hacer login: `turnos`

### Enfermero / Cuidador
- Accede únicamente a `TabAgenda`
- Ve las dosis de su turno (actualmente muestra todas — pendiente filtrar por `cuidadorId`)
- Puede marcar dosis como **APLICADO** o **NO APLICADO** (con motivo obligatorio)
- Al confirmar/omitir, se genera entrada automática en la `bitacora`
- Primera tab al hacer login: `agenda`

---

## Restricciones de Seguridad por Feature

### Asignación de Dosis (TabDosis)
- **Motor de validación de alergias:** Antes de guardar una dosis, se compara `medicamento.formula` y `medicamento.nombre` contra la lista de alergias del residente
- Si hay coincidencia → **bloqueo total** del formulario, botón deshabilitado, alerta visual prominente
- Esta validación es en el cliente; al integrar Supabase, replicar como trigger o función en el servidor

### Bitácora (TabBitacora)
- Solo lectura — no hay UI para editar ni eliminar entradas
- Al integrar Supabase, la tabla `bitacora` debe tener política RLS de solo INSERT para usuarios autenticados y SELECT según rol

### Agenda (TabAgenda)
- El botón "APLICADO" actualmente usa hardcoded `'Diego Pérez'` — **pendiente** usar `user.nombre` del contexto
- Al integrar Supabase, registrar el `user.id` real como `aplicadaPor`

---

## Plan de Autenticación con Supabase

Al conectar Supabase Auth:

1. Reemplazar el login simulado por `supabase.auth.signInWithPassword()`
2. Guardar el rol en `user_metadata` al crear usuarios: `{ role: 'enfermero', nombre: 'Ana Torres' }`
3. Al iniciar sesión, leer `session.user.user_metadata` para poblar el `AuthUser` del contexto
4. El logout usará `supabase.auth.signOut()` en lugar de limpiar `localStorage`
5. Implementar Row Level Security (RLS) en Supabase para cada tabla:
   - `medicamentos`, `residentes`, `personal`: acceso por `establecimiento_id`
   - `dosis`: el enfermero solo ve filas donde `cuidador_id = auth.uid()`
   - `bitacora`: INSERT para todos los roles autenticados, SELECT según rol
6. No almacenar tokens manualmente — Supabase JS SDK los maneja vía `localStorage` automáticamente

---

## Privacidad desde el Diseño (Privacy by Design)

Principios aplicados actualmente:

| Principio | Implementación |
|-----------|---------------|
| Minimización de datos | Residentes sin nombre real; solo apodo/código |
| Seguridad por defecto | Alergias bloquean asignaciones antes de guardar |
| Visibilidad | Advertencia en LoginScreen sobre datos locales |
| Separación | Roles limitan acceso a datos sensibles (bitácora, dosis) |

Principios pendientes de implementar con Supabase:

| Principio | Plan |
|-----------|------|
| Control de acceso técnico | RLS en base de datos por rol y `establecimiento_id` |
| Encriptación | Campo `alergias` de `residentes` con encriptación a nivel columna (pgcrypto) |
| Auditoría técnica | `created_by` y `updated_by` en tablas con `auth.uid()` automático via triggers |
| Retención | Política de borrado lógico (`deleted_at`) en lugar de DELETE físico |
