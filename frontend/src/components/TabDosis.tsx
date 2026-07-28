import { useState, useEffect, useMemo } from 'react';
import {
  Syringe,
  Save,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Trash2,
  Clock,
} from 'lucide-react';
import { useApp } from '@/store';
import { SectionTitle, Field, TextInput, Select, Badge, KiroNote } from '@/components/ui';

// Frecuencias disponibles como horas (valor numérico para la API)
const FRECUENCIAS: { label: string; hours: number }[] = [
  { label: 'Cada 4 hrs', hours: 4 },
  { label: 'Cada 6 hrs', hours: 6 },
  { label: 'Cada 8 hrs', hours: 8 },
  { label: 'Cada 12 hrs', hours: 12 },
  { label: 'Cada 24 hrs', hours: 24 },
  { label: 'Única dosis', hours: 0 },
];

export function TabDosis() {
  const {
    // Datos de la API
    treatments,
    treatmentsLoading,
    treatmentsError,
    fetchTreatments,
    createTreatment,
    removeTreatment,
    // Catálogos necesarios para los selects
    medications,
    fetchMedications,
    staff,
    fetchStaff,
    // Usuario autenticado (médico prescriptor)
    user,
  } = useApp();

  const [form, setForm] = useState({
    resident_id: '',         // UUID del residente (text libre por ahora)
    medication_id: '',       // UUID del medicamento seleccionado
    assigned_staff_id: '',   // UUID del staff seleccionado
    prescribed_dose: '',     // texto libre, ej. "500mg"
    frequency_hours: '',     // string del select → se convierte a number
    start_time: '08:00',
    is_critical: false,
    is_temporary: false,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    fetchTreatments();
    if (medications.length === 0) fetchMedications();
    if (staff.length === 0) fetchStaff();
  }, [fetchTreatments, fetchMedications, fetchStaff, medications.length, staff.length]);

  // Medicamento seleccionado (para validación y display)
  const selectedMedication = useMemo(
    () => medications.find((m) => m.id === form.medication_id),
    [medications, form.medication_id]
  );

  // Staff seleccionado
  const selectedStaff = useMemo(
    () => staff.find((s) => s.id === form.assigned_staff_id),
    [staff, form.assigned_staff_id]
  );

  // Helpers de display
  const getMedLabel = (m: { commercial_name: string; concentration?: string }) =>
    `${m.commercial_name}${m.concentration ? ` ${m.concentration}` : ''}`;

  const getStaffLabel = (s: { user?: { full_name?: string }; id: string }) =>
    s.user?.full_name ?? `Staff ${s.id.slice(0, 8)}`;

  const resetForm = () =>
    setForm({
      resident_id: '',
      medication_id: '',
      assigned_staff_id: '',
      prescribed_dose: '',
      frequency_hours: '',
      start_time: '08:00',
      is_critical: false,
      is_temporary: false,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.resident_id.trim() ||
      !form.medication_id ||
      !form.assigned_staff_id ||
      !form.prescribed_dose.trim() ||
      !form.frequency_hours ||
      !form.start_time
    )
      return;

    setSaving(true);
    setSaveError('');
    try {
      await createTreatment({
        resident_id: form.resident_id.trim(),
        medication_id: form.medication_id,
        prescribed_by: user!.id,          // médico autenticado
        assigned_staff_id: form.assigned_staff_id,
        prescribed_dose: form.prescribed_dose.trim(),
        frequency_hours: Number(form.frequency_hours),
        start_time: form.start_time,
        is_critical: form.is_critical,
        is_temporary: form.is_temporary,
      });
      resetForm();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar el tratamiento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este tratamiento?')) return;
    setDeletingId(id);
    try {
      await removeTreatment(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle
        icon={<Syringe size={20} />}
        title="Asignar Dosis / Tratamientos"
        subtitle="Prescripción de tratamientos con validación de Kiro AI"
      />

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card mb-6 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* ID del residente — texto libre hasta conectar /residents */}
          <Field label="ID del Residente *">
            <TextInput
              value={form.resident_id}
              onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
              placeholder="UUID del residente"
              disabled={saving}
            />
          </Field>

          {/* Medicamento */}
          <Field label="Medicamento *">
            <select
              value={form.medication_id}
              onChange={(e) => setForm({ ...form, medication_id: e.target.value })}
              className="input-base"
              disabled={saving}
            >
              <option value="">Seleccionar medicamento...</option>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {getMedLabel(m)}
                </option>
              ))}
            </select>
          </Field>

          {/* Dosis prescrita */}
          <Field label="Dosis Prescrita *">
            <TextInput
              value={form.prescribed_dose}
              onChange={(e) => setForm({ ...form, prescribed_dose: e.target.value })}
              placeholder="ej. 500mg, 10 UI"
              disabled={saving}
            />
          </Field>

          {/* Frecuencia */}
          <Field label="Frecuencia *">
            <select
              value={form.frequency_hours}
              onChange={(e) => setForm({ ...form, frequency_hours: e.target.value })}
              className="input-base"
              disabled={saving}
            >
              <option value="">Seleccionar...</option>
              {FRECUENCIAS.map((f) => (
                <option key={f.label} value={f.hours}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Hora de inicio */}
          <Field label="Hora de Inicio *">
            <TextInput
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              disabled={saving}
            />
          </Field>

          {/* Staff responsable */}
          <Field label="Enfermero / Cuidador Responsable *">
            <select
              value={form.assigned_staff_id}
              onChange={(e) => setForm({ ...form, assigned_staff_id: e.target.value })}
              className="input-base"
              disabled={saving}
            >
              <option value="">Seleccionar...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {getStaffLabel(s)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Nota del medicamento seleccionado */}
        {selectedMedication && (
          <div className="mt-4">
            <KiroNote>
              {getKiroNote(
                selectedMedication.commercial_name,
                selectedMedication.active_ingredient,
                form.start_time
              )}
            </KiroNote>
          </div>
        )}

        {/* Toggles */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, is_critical: !form.is_critical })}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              form.is_critical
                ? 'bg-red-100 text-red-700 ring-2 ring-red-300 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700'
                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${form.is_critical ? 'bg-red-500' : 'bg-slate-400'}`} />
            Alta Criticidad
          </button>

          <button
            type="button"
            onClick={() => setForm({ ...form, is_temporary: !form.is_temporary })}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              form.is_temporary
                ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700'
                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${form.is_temporary ? 'bg-amber-500' : 'bg-slate-400'}`} />
            Tratamiento Temporal
          </button>
        </div>

        {/* Prescriptor */}
        {user && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldAlert size={13} className="text-brand-500" />
            Prescrito por: <span className="font-semibold text-slate-700 dark:text-slate-200">{user.nombre}</span>
          </div>
        )}

        {saveError && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{saveError}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60"
          >
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> Guardando...</>
              : <><Save size={16} /> Guardar y Programar Tratamiento</>
            }
          </button>
          <button
            type="button"
            onClick={() => fetchTreatments()}
            className="btn-ghost"
            title="Recargar lista"
          >
            <RefreshCw size={16} />
          </button>
          {saved && (
            <span className="animate-fade-in text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Tratamiento programado correctamente
            </span>
          )}
        </div>
      </form>

      {/* Tabla de tratamientos */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tratamientos Activos ({treatments.length})
          </h3>
          {treatmentsLoading && (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          )}
        </div>

        {treatmentsError && (
          <div className="px-5 py-3 text-sm text-red-600 dark:text-red-400">
            Error: {treatmentsError} —{' '}
            <button onClick={() => fetchTreatments()} className="underline">
              reintentar
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Residente</th>
                <th className="px-5 py-3 font-semibold">Medicamento</th>
                <th className="px-5 py-3 font-semibold">Dosis</th>
                <th className="px-5 py-3 font-semibold">Frecuencia</th>
                <th className="px-5 py-3 font-semibold">Inicio</th>
                <th className="px-5 py-3 font-semibold">Cuidador</th>
                <th className="px-5 py-3 font-semibold">Tipo</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {treatments.map((t) => {
                const med = medications.find((m) => m.id === t.medication_id);
                const stf = staff.find((s) => s.id === t.assigned_staff_id);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {t.resident_id.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {med ? getMedLabel(med) : `${t.medication_id.slice(0, 8)}…`}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {t.prescribed_dose}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        {t.frequency_hours === 0
                          ? 'Única dosis'
                          : `Cada ${t.frequency_hours} hrs`}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {t.start_time}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {stf ? getStaffLabel(stf) : `${t.assigned_staff_id.slice(0, 8)}…`}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.is_critical && <Badge color="red">Crítico</Badge>}
                        {t.is_temporary && <Badge color="amber">Temporal</Badge>}
                        {!t.is_critical && !t.is_temporary && (
                          <Badge color="slate">Normal</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Eliminar tratamiento"
                      >
                        {deletingId === t.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} />
                        }
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!treatmentsLoading && treatments.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              No hay tratamientos programados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Notas contextuales Kiro AI ───────────────────────────────────────────────

function getKiroNote(
  nombre: string,
  principioActivo: string | undefined,
  hora: string
): string {
  const n = nombre.toLowerCase();
  const pa = (principioActivo ?? '').toLowerCase();
  const h = parseInt(hora);

  if (n.includes('insulina') || pa.includes('insulina'))
    return 'Administrar antes del desayuno. Verificar glucemia capilar previa.';
  if (n.includes('oftálm') || n.includes('gotas') || pa.includes('hipromelosa'))
    return 'Aplicar gotas en ambos ojos. Evitar contacto del gotero con el párpado.';
  if (n.includes('losartán') || pa.includes('losartán') || n.includes('paracetamol') || pa.includes('acetaminofén'))
    return 'Administrar después de los alimentos con un vaso de agua.';
  if (h < 8)
    return 'Administrar con el estómago vacío o antes de alimentos.';
  return 'Administrar según indicación médica. Verificar identidad del residente antes de administrar.';
}
