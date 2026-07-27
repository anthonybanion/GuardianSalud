# GuardiánSalud Frontend — Tareas de Implementación

## Estado del Proyecto

**Fase actual:** Demo funcional en memoria  
**Próxima fase:** Integración con Supabase + mejoras de UX

---

## ✅ Completado — Base Funcional

- [x] **T-01** Setup del proyecto: Vite + React + TypeScript + Tailwind
- [x] **T-02** Definición de tipos TypeScript (`src/types.ts`)
- [x] **T-03** Datos semilla demo (`src/data.ts`)
- [x] **T-04** Estado global con React Context (`src/store.tsx`)
- [x] **T-05** Design system interno (`src/components/ui.tsx`)
- [x] **T-06** Pantalla de login con acceso rápido demo por rol (`LoginScreen.tsx`)
- [x] **T-07** Header responsive con navegación por tabs y chip de usuario (`Header.tsx`)
- [x] **T-08** Toggle dark/light mode con persistencia en localStorage
- [x] **T-09** Tab Registros Base — Medicamentos (formulario + tabla + StockBadge)
- [x] **T-10** Tab Registros Base — Residentes (formulario + campo crítico de alergias)
- [x] **T-11** Tab Registros Base — Personal (formulario + toggle de especialidades)
- [x] **T-12** Tab Cuidadores y Turnos (formulario + plantilla del día por turno)
- [x] **T-13** Tab Asignar Dosis (formulario + motor de validación de alergias en tiempo real)
- [x] **T-14** Tab Agenda del Turno (tarjetas de dosis + confirmar/omitir + modal motivo)
- [x] **T-15** Tab Agenda — resumen con ring SVG de progreso y panel de alertas
- [x] **T-16** Tab Bitácora con filtros por fecha, residente y cuidador
- [x] **T-17** Control de acceso por rol: tabs visibles según ROLE_TABS
- [x] **T-18** Persistencia de sesión en localStorage
- [x] **T-19** Notas contextuales Kiro AI Semaforito en TabAgenda
- [x] **T-20** Alerta de dosis crítica pendiente en TabAgenda

---

## 🔧 Pendiente — Correcciones y Mejoras

### Bugs conocidos

- [ ] **T-21** `TabAgenda`: reemplazar `'Diego Pérez'` hardcoded en `aplicarDosis` por `user.nombre` del contexto
  - Archivo: `src/components/TabAgenda.tsx` línea del botón APLICADO
  - Fix: `aplicarDosis(d.id, user!.nombre)`

- [ ] **T-22** `TabTurnos`: la plantilla del día muestra todas las asignaciones sin filtrar por `form.fecha`
  - Fix: agregar `asignaciones.filter(a => a.fecha === form.fecha)` en la vista de tarjetas

- [ ] **T-23** `PersonalPanel`: usar tipos correctos en lugar de `as any` para `rol` y `turnoPref`
  - Fix: cambiar `form.rol as any` → `form.rol as RolPersonal`

- [ ] **T-24** `TabAgenda`: el enfermero debe ver solo las dosis donde `cuidadorId === user.id` (actualmente ve todas)
  - Fix: filtrar `dosis.filter(d => d.cuidadorId === personal.find(p => p.nombre === user.nombre)?.id)`

### Funcionalidades faltantes

- [ ] **T-25** Editar registros existentes: Medicamentos, Residentes, Personal
  - Agregar botón "Editar" en cada fila de tabla
  - Reutilizar el mismo formulario en modo edición
  - Agregar `updateMedicamento`, `updateResidente`, `updatePersonal` al store

- [ ] **T-26** Eliminar registros: Medicamentos, Residentes, Personal
  - Agregar botón "Eliminar" con confirmación modal
  - Agregar `deleteMedicamento`, `deleteResidente`, `deletePersonal` al store
  - Validar que no existan dosis activas antes de eliminar medicamento/residente

- [ ] **T-27** Exportar reporte al "Cerrar Turno"
  - Generar PDF o CSV con las dosis del turno (aplicadas, omitidas, notas)
  - Usar `window.print()` con estilos de impresión o librería como `jspdf`

- [ ] **T-28** Confirmación antes de cerrar sesión (modal o `confirm()`)

- [ ] **T-29** Buscar/filtrar en tablas del catálogo de Medicamentos, Residentes y Personal

- [ ] **T-30** Mostrar el rol del usuario en el chip del Header (actualmente solo muestra nombre)

---

## 🗄️ Pendiente — Integración con Supabase

### Setup inicial

- [ ] **T-31** Crear proyecto en Supabase y configurar variables de entorno
  - Crear `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
  - Agregar `.env.local` al `.gitignore`

- [ ] **T-32** Crear `src/lib/supabase.ts` con el cliente inicializado

- [ ] **T-33** Crear el esquema de base de datos en Supabase
  - Tablas: `medicamentos`, `residentes`, `personal`, `asignaciones_turno`, `dosis`, `bitacora`
  - Tipos ENUM de Postgres para: `presentacion`, `via_admin`, `rol_personal`, `turno_tipo`, `estado_dosis`
  - Columnas `created_at` con `DEFAULT now()` y `id` con `DEFAULT gen_random_uuid()`

- [ ] **T-34** Script SQL de seed inicial equivalente a `src/data.ts`

### Autenticación

- [ ] **T-35** Reemplazar login simulado por `supabase.auth.signInWithPassword()`
  - Crear usuarios en Supabase Dashboard con `user_metadata: { role, nombre }`

- [ ] **T-36** Reemplazar logout por `supabase.auth.signOut()`

- [ ] **T-37** Implementar `supabase.auth.onAuthStateChange()` para restaurar sesión al recargar

- [ ] **T-38** Eliminar manejo manual de `localStorage` para sesión (Supabase SDK lo maneja)

### Migración del Store

- [ ] **T-39** Convertir `addMedicamento` a `supabase.from('medicamentos').insert()`
- [ ] **T-40** Convertir `addResidente` a `supabase.from('residentes').insert()`
- [ ] **T-41** Convertir `addPersonal` a `supabase.from('personal').insert()`
- [ ] **T-42** Convertir `addAsignacion` a `supabase.from('asignaciones_turno').insert()`
- [ ] **T-43** Convertir `addDosis` a `supabase.from('dosis').insert()`
- [ ] **T-44** Convertir `aplicarDosis` y `noAplicarDosis` a `supabase.from('dosis').update()` + insert en `bitacora`
- [ ] **T-45** Cargar datos iniciales al montar `AppProvider` con `supabase.from('...').select()`
- [ ] **T-46** Eliminar `genId()` y datos semilla del store — los IDs los genera Postgres

### Seguridad

- [ ] **T-47** Implementar Row Level Security (RLS) en Supabase para todas las tablas
  - `medicamentos`, `residentes`, `personal`: acceso por `establecimiento_id`
  - `dosis`: enfermero solo ve filas donde `cuidador_id = auth.uid()`
  - `bitacora`: INSERT para todos los roles, SELECT por rol

- [ ] **T-48** Encriptar el campo `alergias` en la tabla `residentes` con `pgcrypto`

- [ ] **T-49** Crear triggers Postgres para `created_by` y `updated_by` automáticos vía `auth.uid()`

### Tiempo real (opcional)

- [ ] **T-50** Suscribir `TabAgenda` a cambios en tiempo real de `dosis` vía `supabase.channel()`
  - Permite que varios cuidadores vean actualizaciones en vivo sin recargar

---

## Orden de Implementación Recomendado

```
Fase 1 (bugs urgentes):    T-21 → T-22 → T-23 → T-24
Fase 2 (funcionalidad):    T-25 → T-26 → T-29 → T-28 → T-30 → T-27
Fase 3 (Supabase base):    T-31 → T-32 → T-33 → T-34 → T-35 → T-36 → T-37 → T-38
Fase 4 (migrar store):     T-39 → T-40 → T-41 → T-42 → T-43 → T-44 → T-45 → T-46
Fase 5 (seguridad):        T-47 → T-48 → T-49
Fase 6 (tiempo real):      T-50
```
