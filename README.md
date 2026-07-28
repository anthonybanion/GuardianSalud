# GuardiánSalud

Sistema web para el **control y seguimiento de medicamentos** en asilos, estancias y centros de cuidado de pacientes. Garantiza un registro preciso de horarios, dosis, uso del medicamento y asignación por paciente, priorizando la **Privacidad desde el Diseño** (*Privacy by Design*).
<img width="1089" height="768" alt="LogoGS" src="https://github.com/user-attachments/assets/a488bd89-d5e8-4458-b046-bce63a75b61d" />

---
## 🎯Problema

En muchos centros de cuidado la administración de medicamentos continúa apoyándose en registros manuales y comunicación entre turnos.

Esto puede dificultar:

- el seguimiento de las dosis
- la trazabilidad
- la consulta del historial
- la organización del personal

GuardiánSalud busca digitalizar este proceso.

---
## Demo en Vivo

| Capa | URL |
|------|-----|
| Frontend | [guardian-salud.vercel.app](https://guardian-salud.vercel.app) |
| Backend (API) | [guardian-salud-dev.onrender.com](https://guardian-salud-dev.onrender.com) |
| Swagger / Docs | [guardian-salud-dev.onrender.com/docs](https://guardian-salud-dev.onrender.com/docs) |

---

## Acceso al Sistema

### Usuarios de prueba

| Correo | Rol | Acceso |
|--------|-----|--------|
| `admin@guardian.com` | Administrador | Todas las secciones |
| `medico@guardian.com` | Médico | Turnos, Asignar Dosis, Bitácora |
| `enfermera@guardian.com` | Enfermero/a | Agenda del Turno |

**Contraseña para todos:** `password123`

---

## Funcionalidades

### Registros Base (Admin)
- Catálogo de medicamentos con control de stock (semáforo)
- Registro de residentes/pacientes con apodo (sin datos personales reales)
- Alta de personal/cuidadores con especialidades y turno preferente

### Cuidadores y Turnos (Admin + Médico)
- Asignación de personal a turnos (Matutino, Vespertino, Nocturno)
- Plantilla visual del día filtrada por fecha
- Zona/área de cobertura por colaborador

### Asignar Dosis / Tratamientos (Admin + Médico)
- Prescripción vinculando residente + medicamento + enfermero responsable
- Frecuencia en horas, hora de inicio, criticidad
- Notas contextuales de Kiro AI por medicamento

### Agenda del Turno (Todos los roles)
- Vista de ejecución diaria con tarjetas por tratamiento
- Botones APLICADO / NO APLICADO con registro automático en bitácora
- Progreso visual en anillo SVG
- Alertas de dosis críticas pendientes

### Bitácora de Auditoría (Admin + Médico)
- Historial completo de dosis aplicadas y omitidas
- Filtros por fecha, estado y cuidador firmante
- Solo lectura — trazabilidad inmutable

---

## Arquitectura

```
GuardianSalud/
├── frontend/          ← React 18 + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── lib/      ← Servicios API (auth, staff, medications, etc.)
│   │   ├── components/
│   │   ├── store.tsx  ← Estado global (Context API)
│   │   └── types.ts   ← Tipos + mapeo de roles backend/frontend
│   └── package.json
├── backend/           ← NestJS + Prisma + PostgreSQL
│   └── ...
└── README.md          ← Este archivo
```

---

## Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 (dark/light mode)
- Lucide React (iconografía)
- React Context API (estado global)

### Backend
- NestJS (Node.js)
- Prisma ORM
- PostgreSQL
- JWT (autenticación Bearer)
- Swagger/OpenAPI (documentación)

### Infraestructura
- Frontend: **Vercel** (CI/CD automático)
- Backend: **Render**
- Base de datos: **PostgreSQL** (en Render)

---

## Privacidad desde el Diseño (Privacy by Design)

| Principio | Implementación |
|-----------|---------------|
| Minimización de datos | Residentes sin nombre real — solo apodo/código |
| Seguridad por defecto | Validación de alergias bloquea asignaciones riesgosas |
| Control de acceso | 3 roles con permisos mínimos necesarios |
| Trazabilidad | Bitácora append-only, nunca se edita ni elimina |
| Transparencia | Aviso de sistema visible en login |

---

## Instalación Local

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
# → http://localhost:3000
```

---

## API REST — Endpoints Principales

| Recurso | Ruta | Métodos |
|---------|------|---------|
| Auth | `/auth/login`, `/auth/me` | POST, GET |
| Usuarios | `/users` | GET, POST, PATCH, DELETE |
| Staff | `/staff` | GET, POST, PATCH, DELETE |
| Medicamentos | `/medications` | GET, POST, PATCH, DELETE |
| Residentes | `/residents` | GET, POST, PATCH, DELETE |
| Tratamientos | `/treatments` | GET, POST, PATCH, DELETE |
| Turnos | `/shift-assignments` | GET, POST, PATCH, DELETE |
| Bitácora | `/dose-logs` | GET, POST, PATCH, DELETE |

Documentación completa en Swagger: `/docs`

---

## 💡 Futuras mejoras

- Notificaciones push
- OCR para medicamentos
- Portal para familiares
- Integración con historia clínica
- IA predictiva

---
## Equipo 128
  - Victor Manuel Hernandez Tiburcio
  - Anthony Enrique Bañon Arias
  - Aimé Pamela Valdez
  - Diego Terrazas Sanchez

Proyecto desarrollado para el **Hackathon Kiro 2026**.

Enfocado en la gestión operativa de medicamentos para centros de cuidado de adultos mayores, con énfasis en seguridad del paciente y privacidad de datos.

---

## Licencia

Uso exclusivo para el hackathon. Todos los derechos reservados.
