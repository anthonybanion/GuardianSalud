# Guardián Salud - Contexto del Proyecto

## Descripción del Proyecto

Guardián Salud es un sistema de gestión de medicación y cuidados para residencias de adultos mayores.

El objetivo principal es digitalizar y mejorar el control de tratamientos médicos, administración de medicamentos y seguimiento del personal clínico.

El sistema permite:

- Gestionar usuarios y roles.
- Administrar personal médico y de enfermería.
- Gestionar residentes.
- Gestionar catálogo de medicamentos.
- Asignar tratamientos.
- Controlar turnos del personal.
- Registrar administración de dosis.
- Incorporar instrucciones asistidas por IA.

---

# Objetivos principales

## Seguridad

Garantizar que cada usuario acceda únicamente a las funcionalidades correspondientes según su rol.

Incluye:

- Autenticación mediante JWT.
- Autorización basada en roles.
- Protección de información sensible.
- Validaciones en backend.

---

## Gestión clínica

Permitir:

- Creación de tratamientos.
- Asignación de medicamentos.
- Definición de dosis y frecuencias.
- Seguimiento de administración.
- Registro histórico de acciones.

---

## Escalabilidad

El sistema debe estar preparado para:

- Crecimiento de usuarios.
- Nuevas funcionalidades.
- Integración futura con aplicaciones móviles.
- Integración con servicios de inteligencia artificial.

---

# Stack Tecnológico

## Backend

- Node.js.
- NestJS.
- TypeScript.
- Prisma ORM.
- PostgreSQL.
- Swagger/OpenAPI.
- JWT Authentication.

## Frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS.

## Infraestructura

- PostgreSQL como base de datos principal.
- Backend desplegado en Render.
- Frontend desplegado en Vercel.

---

# Arquitectura General

El backend sigue una arquitectura modular basada en NestJS.

Cada módulo representa una funcionalidad del negocio.

Ejemplos:

```
Auth
Users
Staff
Residents
Medications
Treatments
Shift Assignments
Dose Logs
```

Cada módulo debe mantener separación de responsabilidades:

- Controller:
  Manejo HTTP y entrada/salida de datos.

- Service:
  Reglas de negocio.

- Repository:
  Acceso a base de datos mediante Prisma.

- DTO:
  Validación de datos de entrada.

- Entity:
  Representación de respuestas API.

---

# Roles del Sistema

## ADMIN

Administrador del sistema.

Responsabilidades:

- Gestión completa de usuarios.
- Gestión del personal.
- Gestión de residentes.
- Gestión de medicamentos.
- Gestión de tratamientos.
- Configuración general.

---

## PHYSICIAN

Médico responsable de la planificación clínica.

Puede:

- Crear tratamientos.
- Asignar medicamentos.
- Definir dosis y frecuencia.
- Consultar residentes.
- Consultar bitácora.

No administra:

- Usuarios.
- Catálogo general de medicamentos.

---

## NURSE

Enfermero encargado de ejecutar tratamientos.

Puede:

- Consultar sus turnos.
- Consultar dosis asignadas.
- Registrar administración.
- Registrar omisiones.
- Consultar instrucciones necesarias.

No puede:

- Modificar tratamientos.
- Asignar medicamentos.

---

# Módulos del Sistema

## Auth

Responsable de:

- Login.
- Validación JWT.
- Generación de tokens.
- Usuario autenticado.

---

## Users

Responsable de:

- Usuarios del sistema.
- Credenciales.
- Roles.
- Estado de acceso.

---

## Staff

Responsable de:

- Información profesional del personal clínico.
- Especialidades.
- Turnos preferidos.

Relación:

```
User 1 ---- 0..1 Staff
```

---

## Residents

Responsable de:

- Información interna de residentes.
- Ubicación.
- Condiciones médicas.
- Cuidados especiales.

---

## Medications

Responsable de:

- Catálogo de medicamentos.
- Stock.
- Datos farmacológicos.

---

## Treatments

Responsable de:

- Asignación de tratamientos.
- Relación entre residente, medicamento y personal.

---

## Dose Logs

Responsable de:

- Registro histórico de administración.
- Estados de dosis.
- Auditoría.

---

# Estado Actual del Desarrollo

Implementado:

- Proyecto NestJS configurado.
- Prisma configurado.
- PostgreSQL conectado.
- Swagger configurado.
- Manejo global de errores.
- Configuración por variables de entorno.
- Autenticación JWT.
- Módulo Users.
- Inicio del módulo Staff.

En desarrollo:

- Staff completo.
- Residents.
- Medications.
- Treatments.
- Dose Logs.
- Control de permisos por roles.

---

# Reglas Generales del Proyecto

- Mantener código limpio y modular.
- Seguir principios SOLID.
- Evitar lógica de negocio en Controllers.
- Evitar consultas Prisma fuera de Repository.
- No exponer información sensible.
- Usar DTOs para validar entradas.
- Documentar endpoints con Swagger.
- Mantener consistencia con módulos existentes.

---

# Objetivo de Desarrollo

Construir una API REST profesional, escalable y segura para la gestión de medicación y cuidados en residencias de adultos mayores.