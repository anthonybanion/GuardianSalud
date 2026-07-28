import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Save,
  Clock,
  MapPin,
  User,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/store';
import { SectionTitle, Field, TextInput, Badge } from '@/components/ui';
import type { BackendShift, BackendShiftAssignment } from '@/types';
import { BACKEND_SHIFT_LABEL, SHIFT_TO_BACKEND } from '@/types';

// ─── Config de turnos ─────────────────────────────────────────────────────────

const TURNOS_CONFIG: {
  key: BackendShift;
  label: string;
  horario: string;
  color: string;
}[] = [
  { key: 'MORNING',   label: 'Matutino',   horario: '06:00 – 14:00', color: 'amber' },
  { key: 'AFTERNOON', label: 'Vespertino', horario: '14:00 – 22:00', color: 'brand' },
  { key: 'NIGHT',     label: 'Nocturno',   horario: '22:00 – 06:00', color: 'slate' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function TabTurnos() {
  const {
    shiftAssignments,
    shiftAssignmentsLoading,
    shiftAssignmentsError,
    fetchShiftAssignments,
    createShiftAssignment,
    removeShiftAssignment,
    staff,
    fetchStaff,
    backendUsers,
    fetchUsers,
  } = useApp();

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    staff_id: '',
    shift_type: '' as BackendShift | '',
    shift_date: today,
    assigned_area: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Fecha que se muestra en la plantilla del día
  const [fechaVista, setFechaVista] = useState(today);

  // Cargar datos al montar
  useEffect(() => {
    fetchShiftAssignments();
    if (staff.length === 0) fetchStaff();
    if (backendUsers.length === 0) fetchUsers();
  }, [fetchShiftAssignments, fetchStaff, fetchUsers, staff.length, backendUsers.length]);

  // Helpers
  const resolveUser = (staffId: string) => {
    const s = staff.find((x) => x.id === staffId);
    if (!s) return null;
    if (s.user?.full_name) return s.user.full_name;
    return backendUsers.find((u) => u.id === s.user_id)?.full_name ?? null;
  };

  const getStaffName = (id: string) => {
    return resolveUser(id) ?? `Staff ${id.slice(0, 8)}`;
  };

  const resetForm = () =>
    setForm({ staff_id: '', shift_type: '', shift_date: today, assigned_area: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staff_id || !form.shift_type || !form.shift_date) return;
    setSaving(true);
    setSaveError('');
    try {
      await createShiftAssignment({
        staff_id: form.staff_id,
        shift_type: form.shift_type as BackendShift,
        shift_date: form.shift_date,
        assigned_area: form.assigned_area.trim() || undefined,
      });
      // Actualizar vista al día del turno recién creado
      setFechaVista(form.shift_date);
      resetForm();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al asignar turno');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta asignación de turno?')) return;
    setDeletingId(id);
    try {
      await removeShiftAssignment(id);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrar asignaciones por la fecha de vista
  const asignacionesDia = useMemo(
    () => shiftAssignments.filter((a) => a.shift_date === fechaVista),
    [shiftAssignments, fechaVista],
  );

  return (
    <div className="animate-fade-in">
      <SectionTitle
        icon={<CalendarDays size={20} />}
        title="Cuidadores y Turnos"
        subtitle="Asignación de personal a turnos y zonas de cobertura"
      />

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card mb-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Staff */}
          <Field label="Colaborador *">
            <select
              value={form.staff_id}
              onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
              className="input-base"
              disabled={saving}
            >
              <option value="">Seleccionar...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.full_name ?? backendUsers.find((u) => u.id === s.user_id)?.full_name ?? `Staff ${s.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </Field>

          {/* Turno */}
          <Field label="Turno *">
            <select
              value={form.shift_type}
              onChange={(e) =>
                setForm({ ...form, shift_type: e.target.value as BackendShift })
              }
              className="input-base"
              disabled={saving}
            >
              <option value="">Seleccionar...</option>
              {TURNOS_CONFIG.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label} ({t.horario})
                </option>
              ))}
            </select>
          </Field>

          {/* Zona */}
          <Field label="Zona / Área">
            <TextInput
              value={form.assigned_area}
              onChange={(e) => setForm({ ...form, assigned_area: e.target.value })}
              placeholder="ej. Pabellón Norte"
              disabled={saving}
            />
          </Field>

          {/* Fecha */}
          <Field label="Fecha *">
            <TextInput
              type="date"
              value={form.shift_date}
              onChange={(e) => setForm({ ...form, shift_date: e.target.value })}
              disabled={saving}
            />
          </Field>
        </div>

        {saveError && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {saveError}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Guardando...</>
            ) : (
              <><Save size={16} /> Asignar Turno</>
            )}
          </button>
          <button
            type="button"
            onClick={() => fetchShiftAssignments()}
            className="btn-ghost"
            title="Recargar turnos"
          >
            <RefreshCw size={16} />
          </button>
          {saved && (
            <span className="animate-fade-in text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Turno asignado correctamente
            </span>
          )}
        </div>
      </form>

      {/* Selector de fecha de vista */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Plantilla del Día
        </h3>
        <input
          type="date"
          value={fechaVista}
          onChange={(e) => setFechaVista(e.target.value)}
          className="input-base w-auto py-1.5 text-sm"
        />
        <Badge color="blue">{fechaVista}</Badge>
        {shiftAssignmentsLoading && (
          <Loader2 size={14} className="animate-spin text-slate-400" />
        )}
        {shiftAssignmentsError && (
          <span className="text-xs text-red-500">{shiftAssignmentsError}</span>
        )}
      </div>

      {/* Tablero de turnos por tipo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TURNOS_CONFIG.map((turno) => {
          const asigns = asignacionesDia.filter(
            (a) => a.shift_type === turno.key,
          );
          return (
            <div key={turno.key} className="card p-4">
              {/* Header del turno */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-600 dark:text-brand-400" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {turno.label}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {turno.horario}
                </span>
              </div>

              {/* Lista de personal asignado */}
              <div className="space-y-2">
                {asigns.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Sin personal asignado
                  </p>
                ) : (
                  asigns.map((a) => (
                    <AssignCard
                      key={a.id}
                      assignment={a}
                      nombre={getStaffName(a.staff_id)}
                      onDelete={handleDelete}
                      deleting={deletingId === a.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla resumen completa */}
      {shiftAssignments.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Todas las Asignaciones ({shiftAssignments.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Turno</th>
                  <th className="px-5 py-3 font-semibold">Colaborador</th>
                  <th className="px-5 py-3 font-semibold">Área</th>
                  <th className="px-5 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {shiftAssignments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {a.shift_date}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        color={
                          a.shift_type === 'MORNING'
                            ? 'amber'
                            : a.shift_type === 'AFTERNOON'
                            ? 'blue'
                            : 'slate'
                        }
                      >
                        {BACKEND_SHIFT_LABEL[a.shift_type]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {getStaffName(a.staff_id)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {a.assigned_area ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Eliminar asignación"
                      >
                        {deletingId === a.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-componente tarjeta de asignación ─────────────────────────────────────

function AssignCard({
  assignment,
  nombre,
  onDelete,
  deleting,
}: {
  assignment: BackendShiftAssignment;
  nombre: string;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={14} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {nombre}
          </span>
        </div>
        <button
          onClick={() => onDelete(assignment.id)}
          disabled={deleting}
          className="rounded p-1 text-slate-400 hover:text-red-500 disabled:opacity-40"
          title="Quitar del turno"
        >
          {deleting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
        </button>
      </div>
      {assignment.assigned_area && (
        <div className="mt-1 flex items-center gap-1.5 pl-5">
          <MapPin size={12} className="text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {assignment.assigned_area}
          </span>
        </div>
      )}
    </div>
  );
}
