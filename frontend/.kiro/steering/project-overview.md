---
inclusion: always
---

# GuardiánSalud — Visión General del Proyecto

## Descripción
Aplicación web SPA para el **control y seguimiento de medicamentos** en entornos como asilos, estancias y centros de cuidado de pacientes. Garantiza un registro preciso de horarios, dosis, uso del medicamento y asignación por paciente, priorizando la **Privacidad desde el Diseño** (*Privacy by Design*).

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 (dark mode por clase) |
| Íconos | Lucide React |
| Estado global | React Context API + `useState` |
| Persistencia local | `localStorage` (sesión y tema) |
| Base de datos (pendiente) | Supabase (instalado, no conectado aún) |
| Linting | ESLint + typescript-eslint |

## Estructura de Carpetas

```
frontend/
├── src/
│   ├── App.tsx              # Root: AppProvider + AppContent, tab routing
│   ├── main.tsx             # Entry point React DOM
│   ├── store.tsx            # AppContext + AppProvider (estado global)
│   ├── types.ts             # Todos los tipos TypeScript del dominio
│   ├── data.ts              # Seed data demo + constantes de opciones (ROLES, TURNOS, etc.)
│   ├── index.css            # Directivas Tailwind + clases utilitarias custom (.card, .btn-primary, etc.)
│   └── components/
│       ├── ui.tsx           # Componentes UI reutilizables (SectionTitle, Field, TextInput, Select, Badge, etc.)
│       ├── Header.tsx       # Header sticky con navegación por tabs y chip de usuario
│       ├── LoginScreen.tsx  # Pantalla de login con acceso rápido demo por rol
│       ├── TabRegistros.tsx # Tab Admin: sub-tabs Medicamentos / Residentes / Personal
│       ├── TabTurnos.tsx    # Tab Admin+Médico: asignación de turnos por fecha y zona
│       ├── TabDosis.tsx     # Tab Admin+Médico: programación de dosis con validación de alergias
│       ├── TabAgenda.tsx    # Tab Enfermero: ejecución diaria de dosis, confirmar/omitir
│       ├── TabBitacora.tsx  # Tab Admin+Médico: historial de auditoría con filtros
│       └── ThemeSwitcher.tsx # Botón toggle light/dark mode
├── .kiro/
│   ├── steering/            # Contexto persistente para Kiro AI
│   └── specs/               # Especificaciones de features
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Convenciones de Código

### Componentes
- Exportaciones nombradas (`export function TabRegistros`) — nunca `export default` en componentes
- Un archivo por componente principal; sub-componentes del mismo módulo pueden ir en el mismo archivo (ej. `MedicamentosPanel` dentro de `TabRegistros.tsx`)
- Props tipadas con `interface` inline cuando son simples, separadas cuando son reutilizables

### Estado y Store
- Todo el estado de la aplicación vive en `store.tsx` vía `AppContext`
- Mutaciones se exponen como funciones tipadas en `AppState`
- IDs generados con `genId(prefix)` — al migrar a Supabase se reemplazará por UUIDs del servidor
- La sesión se persiste en `localStorage` bajo la clave `guardiansalud_session`

### Estilos
- Clases utilitarias custom definidas en `index.css`: `.card`, `.btn-primary`, `.btn-ghost`, `.input-base`, `.label-base`, `.animate-fade-in`
- Color brand en `tailwind.config.js` como `brand` (azul)
- Dark mode: siempre agregar variante `dark:` a colores de fondo, texto y bordes
- Evitar estilos inline; siempre usar clases Tailwind

### Idioma
- **Todo el UI y comentarios de código están en español**
- Nombres de variables y funciones en camelCase inglés (convención React/TS estándar)
- Mensajes de usuario, labels, placeholders y errores en español mexicano

### Imports
- Alias `@/` apunta a `src/` (configurado en `vite.config.ts` y `tsconfig.app.json`)
- Orden de imports: React → librerías externas → `@/store` → `@/components/ui` → `@/types` → `@/data`

## Patrones UI Establecidos

### Formulario estándar
```tsx
<form onSubmit={handleSubmit} className="card mb-6 p-5">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Field label="Nombre">
      <TextInput value={...} onChange={...} placeholder="..." />
    </Field>
    <Field label="Tipo">
      <Select value={...} onChange={...} options={[...]} placeholder="Seleccionar..." />
    </Field>
  </div>
  <div className="mt-5 flex flex-wrap items-center gap-3">
    <button type="submit" className="btn-primary">
      <Save size={16} /> Guardar
    </button>
    {saved && <span className="animate-fade-in text-sm font-medium text-emerald-600">✓ Guardado</span>}
  </div>
</form>
```

### Tabla estándar
```tsx
<div className="card overflow-hidden">
  <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
    <h3 className="text-sm font-semibold ...">Título ({items.length})</h3>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>...</thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">...</tbody>
    </table>
    {items.length === 0 && <EmptyState message="No hay registros" />}
  </div>
</div>
```

## Privacidad desde el Diseño (Privacy by Design)

- Los residentes/pacientes se identifican únicamente por **apodo o código** (ej. "Abuelo Beto" o "RES-014") — nunca nombre real en UI
- Las alergias se muestran con advertencia visual prominente y bloquean asignaciones riesgosas
- Aviso visible en LoginScreen: "Sistema demostrativo · Los datos se guardan localmente en este dispositivo"
- Al integrar Supabase: usar Row Level Security (RLS) por `user_id` y `role`
