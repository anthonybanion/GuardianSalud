import { useState, useEffect } from 'react';
import { Pill, Users, Stethoscope, Save, AlertTriangle, Plus, X, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '@/store';
import {
  SectionTitle,
  Field,
  TextInput,
  Select,
  Badge,
  EmptyState,
  KiroNote,
} from '@/components/ui';
import {
  PRESENTACIONES,
  VIAS,
  CONDICIONES,
  DIETAS,
  ESPECIALIDADES_DISPONIBLES,
} from '@/data';
import type { SubTabRegistros, BackendShift } from '@/types';
import { BACKEND_SHIFT_LABEL } from '@/types';

const TURNOS_CONFIG: { key: BackendShift; label: string }[] = [
  { key: 'MORNING',   label: 'Matutino' },
  { key: 'AFTERNOON', label: 'Vespertino' },
  { key: 'NIGHT',     label: 'Nocturno' },
];

const SUBTABS: { id: SubTabRegistros; label: string; icon: typeof Pill }[] = [
  { id: 'medicamentos', label: 'Medicamentos / Insumos', icon: Pill },
  { id: 'residentes', label: 'Residentes / Pacientes', icon: Users },
  { id: 'personal', label: 'Personal / Cuidadores', icon: Stethoscope },
];

export function TabRegistros() {
  const [subtab, setSubtab] = useState<SubTabRegistros>('medicamentos');
  return (
    <div className="animate-fade-in">
      {/* Subtab bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {SUBTABS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSubtab(s.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                subtab === s.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={16} />
              {s.label}
            </button>
          );
        })}
      </div>

      {subtab === 'medicamentos' && <MedicamentosPanel />}
      {subtab === 'residentes' && <ResidentesPanel />}
      {subtab === 'personal' && <PersonalPanel />}
    </div>
  );
}

/* =================== MEDICAMENTOS =================== */

function MedicamentosPanel() {
  const {
    medications,
    medicationsLoading,
    medicationsError,
    fetchMedications,
    createMedication,
    removeMedication,
  } = useApp();

  const [form, setForm] = useState({
    commercial_name: '',
    active_ingredient: '',
    concentration: '',
    presentation: '',
    administration_route: '',
    current_stock: '',
    minimum_stock: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cargar medicamentos al montar
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const resetForm = () =>
    setForm({
      commercial_name: '',
      active_ingredient: '',
      concentration: '',
      presentation: '',
      administration_route: '',
      current_stock: '',
      minimum_stock: '',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.commercial_name.trim() || !form.administration_route.trim()) return;
    setSaving(true);
    setSaveError('');
    try {
      await createMedication({
        commercial_name: form.commercial_name.trim(),
        active_ingredient: form.active_ingredient.trim() || undefined,
        concentration: form.concentration.trim() || undefined,
        presentation: form.presentation.trim() || undefined,
        administration_route: form.administration_route.trim(),
        current_stock: form.current_stock ? Number(form.current_stock) : undefined,
        minimum_stock: form.minimum_stock ? Number(form.minimum_stock) : undefined,
      });
      resetForm();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este medicamento?')) return;
    setDeletingId(id);
    try {
      await removeMedication(id);
    } catch {
      // el error se refleja en medicationsError del store
    } finally {
      setDeletingId(null);
    }
  };

  // Semáforo de stock basado en current_stock y minimum_stock
  const getStockColor = (m: { current_stock?: number; minimum_stock?: number }) => {
    const stock = m.current_stock ?? 0;
    const min = m.minimum_stock ?? 10;
    if (stock <= 0) return 'red';
    if (stock <= min) return 'amber';
    return 'green';
  };

  const getStockLabel = (m: { current_stock?: number; minimum_stock?: number }) => {
    const stock = m.current_stock ?? 0;
    const min = m.minimum_stock ?? 10;
    if (stock <= 0) return 'Sin stock';
    if (stock <= min) return `Bajo (${stock})`;
    return `OK (${stock})`;
  };

  return (
    <div>
      <SectionTitle
        icon={<Pill size={20} />}
        title="Medicamentos / Insumos"
        subtitle="Catálogo de medicamentos y control de stock"
      />

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card mb-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre Comercial *">
            <TextInput
              value={form.commercial_name}
              onChange={(e) => setForm({ ...form, commercial_name: e.target.value })}
              placeholder="ej. Insulina NPH"
              disabled={saving}
            />
          </Field>
          <Field label="Principio Activo">
            <TextInput
              value={form.active_ingredient}
              onChange={(e) => setForm({ ...form, active_ingredient: e.target.value })}
              placeholder="ej. Insulina isofana"
              disabled={saving}
            />
          </Field>
          <Field label="Concentración">
            <TextInput
              value={form.concentration}
              onChange={(e) => setForm({ ...form, concentration: e.target.value })}
              placeholder="ej. 500 mg"
              disabled={saving}
            />
          </Field>
          <Field label="Presentación">
            <Select
              value={form.presentation}
              onChange={(v) => setForm({ ...form, presentation: v })}
              options={PRESENTACIONES}
              placeholder="Seleccionar..."
            />
          </Field>
          <Field label="Vía de Administración *">
            <Select
              value={form.administration_route}
              onChange={(v) => setForm({ ...form, administration_route: v })}
              options={VIAS}
              placeholder="Seleccionar..."
            />
          </Field>
          <Field label="Stock Actual">
            <TextInput
              type="number"
              min={0}
              value={form.current_stock}
              onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
              placeholder="0"
              disabled={saving}
            />
          </Field>
          <Field label="Stock Mínimo">
            <TextInput
              type="number"
              min={0}
              value={form.minimum_stock}
              onChange={(e) => setForm({ ...form, minimum_stock: e.target.value })}
              placeholder="10"
              disabled={saving}
            />
          </Field>
        </div>

        {saveError && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{saveError}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> Guardando...</>
              : <><Save size={16} /> Guardar Medicamento</>
            }
          </button>
          <button
            type="button"
            onClick={() => fetchMedications()}
            className="btn-ghost"
            title="Recargar lista"
          >
            <RefreshCw size={16} />
          </button>
          {saved && (
            <span className="animate-fade-in text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Medicamento guardado correctamente
            </span>
          )}
        </div>
      </form>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Catálogo ({medications.length})
          </h3>
          {medicationsLoading && (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          )}
        </div>

        {medicationsError && (
          <div className="px-5 py-3 text-sm text-red-600 dark:text-red-400">
            Error: {medicationsError} —{' '}
            <button onClick={() => fetchMedications()} className="underline">
              reintentar
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Nombre Comercial</th>
                <th className="px-5 py-3 font-semibold">Principio Activo</th>
                <th className="px-5 py-3 font-semibold">Concentración</th>
                <th className="px-5 py-3 font-semibold">Presentación</th>
                <th className="px-5 py-3 font-semibold">Vía</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {medications.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {m.commercial_name}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {m.active_ingredient ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {m.concentration ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {m.presentation ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {m.administration_route}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={getStockColor(m) as 'red' | 'amber' | 'green'}>
                      {getStockLabel(m)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Eliminar medicamento"
                    >
                      {deletingId === m.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!medicationsLoading && medications.length === 0 && (
            <EmptyState message="No hay medicamentos registrados" />
          )}
        </div>
      </div>
    </div>
  );
}

/* =================== RESIDENTES =================== */

function ResidentesPanel() {
  const { residentes, addResidente } = useApp();
  const [form, setForm] = useState({
    apodo: '',
    habitacion: '',
    habitacionCustom: '',
    condicion: '',
    condicionCustom: '',
    dieta: '',
    dietaCustom: '',
    alergias: '',
    cuidados: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apodo) return;
    addResidente({
      apodo: form.apodo,
      habitacion: form.habitacion === 'Otro' ? form.habitacionCustom : form.habitacion,
      condicion: form.condicion === 'Otro / Especificar' ? form.condicionCustom : form.condicion,
      dieta: form.dieta === 'Otro / Especificar' ? form.dietaCustom : form.dieta,
      alergias: form.alergias,
      cuidados: form.cuidados,
    });
    setForm({
      apodo: '', habitacion: '', habitacionCustom: '', condicion: '', condicionCustom: '',
      dieta: '', dietaCustom: '', alergias: '', cuidados: '',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle icon={<Users size={20} />} title="Residentes / Pacientes" subtitle="Registro operativo de residentes del asilo" />

      <form onSubmit={handleSubmit} className="card mb-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Identificador / Apodo">
            <TextInput
              value={form.apodo}
              onChange={(e) => setForm({ ...form, apodo: e.target.value })}
              placeholder="ej. Abuelo Beto o RES-012"
            />
          </Field>
          <Field label="Ubicación / Habitación">
            <Select
              value={form.habitacion}
              onChange={(v) => setForm({ ...form, habitacion: v })}
              options={['Mueble 12 - Cama A', 'Mueble 08 - Cama B', 'Mueble 05 - Cama A', 'Mueble 03 - Cama C', 'Otro']}
              placeholder="Seleccionar..."
            />
          </Field>
          {form.habitacion === 'Otro' && (
            <Field label="Especificar Habitación">
              <TextInput
                value={form.habitacionCustom}
                onChange={(e) => setForm({ ...form, habitacionCustom: e.target.value })}
                placeholder="ej. Mueble 07 - Cama D"
              />
            </Field>
          )}
          <Field label="Condición / Padecimiento">
            <Select
              value={form.condicion}
              onChange={(v) => setForm({ ...form, condicion: v })}
              options={CONDICIONES}
              placeholder="Seleccionar..."
            />
          </Field>
          {form.condicion === 'Otro / Especificar' && (
            <Field label="Especificar Condición">
              <TextInput
                value={form.condicionCustom}
                onChange={(e) => setForm({ ...form, condicionCustom: e.target.value })}
                placeholder="ej. EPOC moderado"
              />
            </Field>
          )}
          <Field label="Dieta y Nutrición">
            <Select
              value={form.dieta}
              onChange={(v) => setForm({ ...form, dieta: v })}
              options={DIETAS}
              placeholder="Seleccionar..."
            />
          </Field>
          {form.dieta === 'Otro / Especificar' && (
            <Field label="Especificar Dieta">
              <TextInput
                value={form.dietaCustom}
                onChange={(e) => setForm({ ...form, dietaCustom: e.target.value })}
                placeholder="ej. Vegetariana blanda"
              />
            </Field>
          )}
          <Field label="Cuidados Especiales / Alertas">
            <TextInput
              value={form.cuidados}
              onChange={(e) => setForm({ ...form, cuidados: e.target.value })}
              placeholder="ej. Movilidad reducida"
            />
          </Field>
        </div>

        {/* Critical allergy section */}
        <div className="mt-4 rounded-xl border-2 border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            <h4 className="text-sm font-bold text-red-700 dark:text-red-300">
              Alergias Médicas y Medicamentos NO Suministrar / Prohibidos
            </h4>
          </div>
          <TextInput
            value={form.alergias}
            onChange={(e) => setForm({ ...form, alergias: e.target.value })}
            placeholder="ej. Alérgico a Penicilina, AINEs"
            className="border-red-300 bg-white dark:border-red-800 dark:bg-slate-900"
          />
          <div className="mt-2">
            <KiroNote>
              ⚠️ Kiro AI usará esta información para bloquear asignaciones de riesgo. Esta información es crítica para la seguridad del residente.
            </KiroNote>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary">
            <Save size={16} /> Registrar Residente
          </button>
          {saved && (
            <span className="animate-fade-in text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Residente registrado correctamente
            </span>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Listado de Residentes ({residentes.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Apodo / ID</th>
                <th className="px-5 py-3 font-semibold">Habitación</th>
                <th className="px-5 py-3 font-semibold">Condición</th>
                <th className="px-5 py-3 font-semibold">Dieta</th>
                <th className="px-5 py-3 font-semibold">Alergias / Contraindicaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {residentes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{r.apodo}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{r.habitacion}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{r.condicion}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{r.dieta}</td>
                  <td className="px-5 py-3">
                    {r.alergias && r.alergias.toLowerCase() !== 'ninguna conocida' ? (
                      <Badge color="red">{r.alergias}</Badge>
                    ) : (
                      <Badge color="green">Sin alergias</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {residentes.length === 0 && <EmptyState message="No hay residentes registrados" />}
        </div>
      </div>
    </div>
  );
}

/* =================== PERSONAL =================== */

function PersonalPanel() {
  const {
    staff, staffLoading, staffError,
    fetchStaff, createStaff, removeStaff,
    backendUsers, fetchUsers, createUser,
  } = useApp();

  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    role: '' as 'NURSE' | 'PHYSICIAN' | '',
    specialties: [] as string[],
    preferred_shift: '' as BackendShift | '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
    if (backendUsers.length === 0) fetchUsers();
  }, [fetchStaff, fetchUsers, backendUsers.length]);

  const toggleEsp = (esp: string) =>
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(esp)
        ? f.specialties.filter((x) => x !== esp)
        : [...f.specialties, esp],
    }));

  const resetForm = () =>
    setForm({ full_name: '', email: '', password: '', role: '', specialties: [], preferred_shift: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password || !form.role) return;
    setSaving(true); setSaveError('');
    try {
      await createUser({ full_name: form.full_name.trim(), email: form.email.trim(), password: form.password, role: form.role, is_active: true });
      await fetchUsers();
      const created = backendUsers.find((u) => u.email === form.email.trim());
      if (created) {
        await createStaff({ user_id: created.id, specialties: form.specialties.join(', ') || undefined, preferred_shift: form.preferred_shift || undefined });
      }
      resetForm(); setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar colaborador');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este colaborador?')) return;
    setDeletingId(id);
    try { await removeStaff(id); } finally { setDeletingId(null); }
  };

  const resolveUser = (userId: string) => backendUsers.find((u) => u.id === userId);
  const getName  = (s: typeof staff[0]) => s.user?.full_name ?? resolveUser(s.user_id)?.full_name ?? '—';
  const getRole  = (s: typeof staff[0]) => { const r = s.user?.role ?? resolveUser(s.user_id)?.role; return r === 'PHYSICIAN' ? 'Médico' : r === 'NURSE' ? 'Enfermero/a' : null; };
  const getRoleColor = (s: typeof staff[0]) => { const r = s.user?.role ?? resolveUser(s.user_id)?.role; return r === 'PHYSICIAN' ? 'blue' : 'green'; };

  return (
    <div>
      <SectionTitle icon={<Stethoscope size={20} />} title="Personal / Cuidadores" subtitle="Registro de colaboradores y competencias" />
      <form onSubmit={handleSubmit} className="card mb-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nombre Completo *">
            <TextInput value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="ej. Diego Pérez" disabled={saving} />
          </Field>
          <Field label="Correo Electrónico *">
            <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@guardiansalud.app" disabled={saving} />
          </Field>
          <Field label="Contraseña inicial *">
            <TextInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" disabled={saving} />
          </Field>
          <Field label="Rol / Puesto *">
            <Select value={form.role} onChange={(v) => setForm({ ...form, role: v as 'NURSE' | 'PHYSICIAN' })} options={['NURSE', 'PHYSICIAN']} placeholder="Seleccionar..." />
          </Field>
          <Field label="Turno Preferente">
            <Select value={form.preferred_shift} onChange={(v) => setForm({ ...form, preferred_shift: v as BackendShift })} options={TURNOS_CONFIG.map((t) => t.key)} placeholder="Seleccionar..." />
          </Field>
        </div>
        <div className="mt-4">
          <label className="label-base">Especialidades / Competencias</label>
          <div className="flex flex-wrap gap-2">
            {ESPECIALIDADES_DISPONIBLES.map((esp) => {
              const active = form.specialties.includes(esp);
              return (
                <button key={esp} type="button" onClick={() => toggleEsp(esp)} disabled={saving}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}>
                  {active ? <X size={12} /> : <Plus size={12} />}{esp}
                </button>
              );
            })}
          </div>
        </div>
        {saveError && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{saveError}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Colaborador</>}
          </button>
          {saved && <span className="animate-fade-in text-sm font-medium text-emerald-600 dark:text-emerald-400">✓ Colaborador guardado correctamente</span>}
        </div>
      </form>
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Colaboradores Registrados ({staff.length})</h3>
          <div className="flex items-center gap-2">
            {staffLoading && <Loader2 size={16} className="animate-spin text-slate-400" />}
            <button onClick={() => { fetchStaff(); fetchUsers(); }} className="btn-ghost py-1 text-xs" title="Recargar"><RefreshCw size={14} /></button>
          </div>
        </div>
        {staffError && <div className="px-5 py-3 text-sm text-red-600 dark:text-red-400">Error: {staffError} — <button onClick={() => fetchStaff()} className="underline">reintentar</button></div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Rol</th>
                <th className="px-5 py-3 font-semibold">Especialidades</th>
                <th className="px-5 py-3 font-semibold">Turno</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">{getName(s)}</td>
                  <td className="px-5 py-3">{getRole(s) ? <Badge color={getRoleColor(s) as 'blue' | 'green'}>{getRole(s)!}</Badge> : <span className="text-xs text-slate-400">—</span>}</td>
                  <td className="px-5 py-3">
                    {s.specialties ? <div className="flex flex-wrap gap-1">{s.specialties.split(',').map((e) => <Badge key={e} color="slate">{e.trim()}</Badge>)}</div> : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3">{s.preferred_shift ? <Badge color="green">{BACKEND_SHIFT_LABEL[s.preferred_shift]}</Badge> : <span className="text-xs text-slate-400">—</span>}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400" title="Eliminar">
                      {deletingId === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!staffLoading && staff.length === 0 && <EmptyState message="No hay colaboradores registrados" />}
        </div>
      </div>
    </div>
  );
}
