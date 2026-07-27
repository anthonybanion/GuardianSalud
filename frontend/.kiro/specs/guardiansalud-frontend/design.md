# GuardiánSalud Frontend — Diseño Técnico

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│  AppProvider (Context) → AppContent → LoginScreen/Tabs  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│       store.tsx          │  ← Estado global centralizado
│  AppContext + AppProvider│  ← React Context API
│  - AuthUser              │
│  - Medicamentos          │
│  - Residentes            │
│  - Personal              │
│  - AsignacionesTurno     │
│  - Dosis                 │
│  - Bitacora              │
│  - Theme                 │
└──────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                   Componentes (src/components/)          │
├──────────────┬──────────────┬───────────────────────────┤
│  LoginScreen │    Header    │       TabRegistros         │
│              │  (nav+user)  │  ┌─ MedicamentosPanel      │
│              │              │  ├─ ResidentesPanel        │
│              │              │  └─ PersonalPanel          │
├──────────────┴──────────────┼───────────────────────────┤
│   TabTurnos  │  TabDosis    │  TabAgenda  │ TabBitacora  │
└──────────────┴──────────────┴─────────────┴─────────────┘
         │
         ▼
┌──────────────────────────┐
│       ui.tsx             │  ← Design System interno
│  SectionTitle, Field,    │
│  TextInput, Select,      │
│  Badge, StockBadge,      │
│  EmptyState, KiroNote    │
└──────────────────────────┘
```

---

## Flujo de Navegación

```
App carga
    │
    ├── user === null ──→ <LoginScreen />
    │                         │
    │                    login(role, nombre, email)
    │                         │
    └── user !== null ──→ <Header /> + <ActiveTab />
                                        │
                          ROLE_TABS[user.role] determina tabs disponibles
                          Primera tab → setActiveTab(ROLE_TABS[role][0])
```

---

## Store — Diseño del Estado Global

### `AppState` interface

```ts
interface AppState {
  // UI
  theme: Theme;
  toggleTheme: () => void;
  activeTab: MainTab;
  setActiveTab: (t: MainTab) => void;

  // Auth
  user: AuthUser | null;
  login: (role: Role, nombre: string, email: string) => void;
  logout: () => void;
  allowedTabs: MainTab[];

  // Catálogos
  medicamentos: Medicamento[];
  addMedicamento: (m: Omit<Medicamento, 'id' | 'createdAt'>) => void;
  residentes: Residente[];
  addResidente: (r: Omit<Residente, 'id' | 'createdAt'>) => void;
  personal: Personal[];
  addPersonal: (p: Omit<Personal, 'id' | 'createdAt'>) => void;

  // Operaciones
  asignaciones: AsignacionTurno[];
  addAsignacion: (a: Omit<AsignacionTurno, 'id'>) => void;
  dosis: Dosis[];
  addDosis: (d: Omit<Dosis, 'id' | 'createdAt' | 'estado'>) => void;
  aplicarDosis: (id: string, aplicadaPor: string) => void;
  noAplicarDosis: (id: string, motivo: string) => void;

  // Auditoría
  bitacora: BitacoraEntry[];
}
```

### Persistencia actual (demo)
- `localStorage['guardiansalud_session']` → `AuthUser` serializado como JSON
- `localStorage['guardiansalud_theme']` → `'light'` | `'dark'`
- Todo el resto es estado en memoria (se pierde al recargar)

### Generación de IDs
```ts
let idCounter = 1000;
const genId = (prefix: string) => `${prefix}-${++idCounter}`;
// Produce: 'med-1001', 'res-1002', etc.
```
Al migrar a Supabase se eliminará este mecanismo y se usarán los UUIDs de Postgres.

---

## Componentes UI (src/components/ui.tsx)

Design system interno. Todos los componentes usan Tailwind y soportan dark mode.

| Componente | Descripción |
|------------|-------------|
| `SectionTitle` | Header de sección con ícono, título y subtítulo |
| `Field` | Wrapper de campo de formulario con label |
| `TextInput` | Input estilizado con soporte de todos los `type` HTML |
| `Select` | Dropdown nativo estilizado |
| `Badge` | Chip de color con variantes: `red`, `green`, `blue`, `amber`, `slate` |
| `StockBadge` | Badge semáforo de stock: verde (>15), amarillo (6-15), rojo (≤5) |
| `EmptyState` | Estado vacío para tablas y listas |
| `KiroNote` | Nota contextual de Kiro AI (fondo brand suave, ícono Sparkles) |

---

## Validación de Alergias (Motor Kiro AI)

Ubicada en `TabDosis.tsx` como `useMemo`:

```
residente.alergias → split por ',' o ';' → lista de términos
  ↓
Por cada término: comparar contra medicamento.formula y medicamento.nombre
  ↓ (coincidencia substring, case-insensitive)
allergyBlock = { alergia: string } | null
  ↓
Si allergyBlock:
  - Mostrar alerta roja "ASIGNACIÓN NO PERMITIDA"
  - Deshabilitar botón submit
  - Bloquear handleSubmit con guard return
```

Esta lógica debe replicarse como validación del lado del servidor al integrar Supabase (función Postgres o Edge Function).

---

## Notas Kiro AI (Semaforito)

Función `getKiroNote(medName, hora)` en `TabAgenda.tsx`:

```
Insulina → "Administrar antes del desayuno. Verificar glucemia capilar previa."
Hora < 8 → "Administrar con el estómago vacío o antes de alimentos."
Oftálmica/Gotas → "Aplicar en ojo derecho e izquierdo. Evitar contacto del gotero."
Losartán/Paracetamol → "Administrar después de los alimentos con un vaso de agua."
Default → "Administrar según indicación médica. Verificar identidad del residente."
```

---

## Plan de Integración con Supabase

### Fase 1: Configuración del cliente

Crear `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Crear `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### Fase 2: Reemplazar Auth simulado

```ts
// login
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
const meta = data.user?.user_metadata;
login(meta.role, meta.nombre, data.user.email);

// logout
await supabase.auth.signOut();

// persistencia de sesión
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) { /* restaurar AuthUser */ }
  else { logout(); }
});
```

### Fase 3: Reemplazar estado en memoria

Cada función del store (`addMedicamento`, `addResidente`, etc.) se convierte en una llamada `supabase.from('tabla').insert(...)`.

Los arrays de estado se poblarán con `supabase.from('tabla').select()` al montar el provider.

Patrón sugerido:
```ts
const addMedicamento = async (m: Omit<Medicamento, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase.from('medicamentos').insert(m).select().single();
  if (!error && data) setMedicamentos(prev => [data, ...prev]);
};
```

### Fase 4: Row Level Security

```sql
-- Ejemplo para tabla dosis
CREATE POLICY "enfermero solo ve sus dosis"
ON dosis FOR SELECT
USING (
  auth.uid() = cuidador_id
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'medico')
  )
);
```

### Fase 5: Migración de IDs

- Todas las tablas usan `UUID` como PK con `DEFAULT gen_random_uuid()`
- `genId()` se elimina del store
- Los seeds de `data.ts` se convierten en un script SQL de seed para Supabase

---

## Diagrama de Componentes por Tab

### TabRegistros (Admin only)
```
TabRegistros
 ├── sub-nav: [Medicamentos | Residentes | Personal]
 ├── MedicamentosPanel
 │    ├── form (nombre, formula, concentracion, presentacion, via, stock)
 │    └── tabla catálogo con StockBadge
 ├── ResidentesPanel
 │    ├── form (apodo, habitacion, condicion, dieta, cuidados)
 │    ├── sección crítica: alergias con KiroNote
 │    └── tabla residentes con Badge alergias
 └── PersonalPanel
      ├── form (nombre, rol, turnoPref)
      ├── toggle especialidades
      └── tabla personal con Badges
```

### TabAgenda (todos los roles)
```
TabAgenda
 ├── banner alerta si hay dosis críticas pendientes
 ├── grid de DosisCards (2 col md)
 │    ├── header: habitación + estado badge
 │    ├── body: residente, medicamento, hora, cuidador, frecuencia
 │    ├── KiroNote (instrucciones contextuales)
 │    └── actions: [APLICADO] [NO APLICADO] o estado final
 ├── panel lateral
 │    ├── progress ring SVG (% completado)
 │    ├── resumen: aplicadas/pendientes/omitidas/total
 │    └── botón "Cerrar Turno y Generar Reporte"
 └── modal de omisión (textarea motivo + confirmar)
```
