import { useState, useEffect, useMemo } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  Pill,
  MapPin,
  User,
  Activity,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/store';
import { SectionTitle, Badge, KiroNote } from '@/components/ui';
import type { BackendTreatment } from '@/types';

export function TabAgenda() {
  const {
    treatments, treatmentsLoading, fetchTreatments,
    doseLogs, fetchDoseLogs, createDoseLog,
    backendResidents, fetchResidents,
    medications, fetchMedications,
    staff, fetchStaff,
    backendUsers, fetchUsers,
    user,
  } = useApp();

  const [omissionModal, setOmissionModal] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [reporteGenerado, setReporteGenerado] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    fetchTreatments();
    fetchDoseLogs();
    if (backendResidents.length === 0) fetchResidents();
    if (medications.length === 0) fetchMedications();
    if (staff.length === 0) fetchStaff();
    if (backendUsers.length === 0) fetchUsers();
  }, [fetchTreatments, fetchDoseLogs, fetchResidents, fetchMedications, fetchStaff, fetchUsers,
      backendResidents.length, medications.length, staff.length, backendUsers.length]);

  // Lookup helpers
  const getResident = (id: string) => backendResidents.find((r) => r.id === id);
  const getMed = (id: string) => medications.find((m) => m.id === id);
  const getStaffName = (staffId: string) => {
    const s = staff.find((x) => x.id === staffId);
    if (s?.user?.full_name) return s.user.full_name;
    return backendUsers.find((u) => u.id === (s?.user_id ?? staffId))?.full_name ?? '—';
  };

  // Determinar estado de cada tratamiento basado en dose_logs
  const treatmentStatus = useMemo(() => {
    const map: Record<string, 'APPLIED' | 'OMITTED' | 'PENDING'> = {};
    for (const t of treatments) {
      // Buscar si ya existe un dose_log para este treatment hoy
      const today = new Date().toISOString().slice(0, 10);
      const log = doseLogs.find(
        (dl) => dl.treatment_id === t.id && dl.scheduled_at.slice(0, 10) === today
      );
      map[t.id] = log?.status ?? 'PENDING';
    }
    return map;
  }, [treatments, doseLogs]);

  // Buscar el doseLog asociado para obtener hora
  const getDoseLog = (treatmentId: string) =>
    doseLogs.find((dl) => dl.treatment_id === treatmentId);

  // Clasificar
  const pendientes = treatments.filter((t) => treatmentStatus[t.id] === 'PENDING');
  const aplicadas = treatments.filter((t) => treatmentStatus[t.id] === 'APPLIED');
  const omitidas = treatments.filter((t) => treatmentStatus[t.id] === 'OMITTED');
  const total = treatments.length;
  const completado = total > 0 ? Math.round((aplicadas.length / total) * 100) : 0;

  const proximaCritica = pendientes.find((t) => t.is_critical);

  // ── Acciones ──────────────────────────────────────────────────────────────

  const handleAplicar = async (t: BackendTreatment) => {
    setProcessingId(t.id);
    try {
      const now = new Date();
      await createDoseLog({
        treatment_id: t.id,
        resident_id: t.resident_id,
        staff_id: t.assigned_staff_id,
        scheduled_at: `${now.toISOString().slice(0, 10)}T${t.start_time}:00.000Z`,
        administered_at: now.toISOString(),
        status: 'APPLIED',
      });
      await fetchDoseLogs();
    } catch { /* error ya visible en el store */ }
    finally { setProcessingId(null); }
  };

  const handleNoAplicar = async () => {
    if (!omissionModal || !motivo.trim()) return;
    const t = treatments.find((x) => x.id === omissionModal);
    if (!t) return;
    setProcessingId(t.id);
    try {
      const now = new Date();
      await createDoseLog({
        treatment_id: t.id,
        resident_id: t.resident_id,
        staff_id: t.assigned_staff_id,
        scheduled_at: `${now.toISOString().slice(0, 10)}T${t.start_time}:00.000Z`,
        status: 'OMITTED',
        omission_reason: motivo.trim(),
      });
      await fetchDoseLogs();
    } catch { /* error ya visible */ }
    finally {
      setProcessingId(null);
      setOmissionModal(null);
      setMotivo('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle icon={<CalendarClock size={20} />} title="Agenda del Turno" subtitle="Ejecución diaria de dosis programadas" />
        <button onClick={() => { fetchTreatments(); fetchDoseLogs(); }} className="btn-ghost" title="Recargar">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Critical alert banner */}
      {proximaCritica && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Clock size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">⏰ Dosis crítica pendiente</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {getMed(proximaCritica.medication_id)?.commercial_name} — {getResident(proximaCritica.resident_id)?.nickname}
            </p>
          </div>
        </div>
      )}

      {treatmentsLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Cargando tratamientos...
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* Main grid — tarjetas de tratamientos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {treatments.map((t) => {
            const status = treatmentStatus[t.id] ?? 'PENDING';
            const res = getResident(t.resident_id);
            const med = getMed(t.medication_id);
            const isPendiente = status === 'PENDING';
            const isAplicada = status === 'APPLIED';
            const isOmitida = status === 'OMITTED';
            const log = getDoseLog(t.id);

            return (
              <div
                key={t.id}
                className={`card card-hover overflow-hidden ${
                  isAplicada ? 'ring-2 ring-emerald-300 dark:ring-emerald-700' : ''
                } ${isOmitida ? 'ring-2 ring-red-300 dark:ring-red-700' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {res?.room_location ?? '—'}
                    </span>
                  </div>
                  {t.is_critical && isPendiente && <Badge color="red">Crítica</Badge>}
                  {isAplicada && <Badge color="green">Aplicada</Badge>}
                  {isOmitida && <Badge color="red">Omitida</Badge>}
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
                      <Pill size={20} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {res?.nickname ?? '—'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {med?.commercial_name ?? '—'} · {med?.administration_route ?? ''}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {t.start_time}</span>
                    <span className="inline-flex items-center gap-1"><User size={12} /> {getStaffName(t.assigned_staff_id)}</span>
                    <span className="inline-flex items-center gap-1"><Activity size={12} /> Cada {t.frequency_hours}h</span>
                  </div>

                  {/* Dosis prescrita */}
                  <p className="mb-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Dosis: {t.prescribed_dose}
                  </p>

                  {/* Kiro note */}
                  {isPendiente && med && (
                    <div className="mb-3">
                      <KiroNote>
                        {t.ai_instructions ?? getKiroNote(med.commercial_name, med.active_ingredient, t.start_time)}
                      </KiroNote>
                    </div>
                  )}

                  {/* Applied banner */}
                  {isAplicada && log && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        Aplicada a las {log.administered_at ? new Date(log.administered_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                  )}

                  {isOmitida && log && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
                      <XCircle size={16} className="text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">
                        No aplicada: {log.omission_reason ?? 'Sin motivo'}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {isPendiente && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAplicar(t)}
                        disabled={processingId === t.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
                      >
                        {processingId === t.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} APLICADO
                      </button>
                      <button
                        onClick={() => setOmissionModal(t.id)}
                        disabled={processingId === t.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 active:scale-[0.98] disabled:opacity-60"
                      >
                        <XCircle size={18} /> NO APLICADO
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!treatmentsLoading && treatments.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-slate-400">
              No hay tratamientos programados
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-100">Resumen del Turno</h3>
            {/* Progress ring */}
            <div className="mb-5 flex flex-col items-center">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-700" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - completado / 100)}`}
                    className="text-emerald-500 transition-all duration-500" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completado}%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">completado</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Aplicadas</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{aplicadas.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Pendientes</span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{pendientes.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
                <span className="text-xs font-medium text-red-700 dark:text-red-300">Omitidas</span>
                <span className="text-sm font-bold text-red-700 dark:text-red-300">{omitidas.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/40">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{total}</span>
              </div>
            </div>
            <button
              onClick={() => { setReporteGenerado(true); setTimeout(() => setReporteGenerado(false), 3000); }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
            >
              <FileText size={16} /> Cerrar Turno y Generar Reporte
            </button>
            {reporteGenerado && (
              <p className="mt-2 animate-fade-in text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ Reporte generado</p>
            )}
          </div>

          {/* Alertas */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Alertas Activas</h3>
            <div className="space-y-2">
              {proximaCritica && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Dosis crítica: {getMed(proximaCritica.medication_id)?.commercial_name}
                  </p>
                </div>
              )}
              {pendientes.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
                  <Clock size={16} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" />
                  <p className="text-xs text-brand-700 dark:text-brand-300">{pendientes.length} dosis pendientes</p>
                </div>
              )}
              {pendientes.length === 0 && !proximaCritica && (
                <p className="text-xs text-slate-400">Sin alertas activas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal omisión */}
      {omissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-5">
            <h3 className="mb-2 text-base font-bold text-slate-800 dark:text-slate-100">Registrar Omisión</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Indique el motivo por el cual no se aplicó la dosis:
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="input-base resize-none"
              placeholder="ej. Residente dormido / Rechazó medicamento..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setOmissionModal(null); setMotivo(''); }} className="btn-ghost">Cancelar</button>
              <button onClick={handleNoAplicar} disabled={!motivo.trim() || !!processingId} className="btn-primary disabled:opacity-60">
                {processingId ? <Loader2 size={14} className="animate-spin" /> : null} Confirmar Omisión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getKiroNote(nombre: string, principioActivo: string | undefined, hora: string): string {
  const n = nombre.toLowerCase();
  const pa = (principioActivo ?? '').toLowerCase();
  const h = parseInt(hora);
  if (n.includes('insulina') || pa.includes('insulina')) return 'Administrar antes del desayuno. Verificar glucemia capilar previa.';
  if (n.includes('oftálm') || n.includes('gotas')) return 'Aplicar gotas en ambos ojos. Evitar contacto del gotero.';
  if (n.includes('losartán') || n.includes('paracetamol') || pa.includes('acetaminofén')) return 'Administrar después de alimentos con agua.';
  if (h < 8) return 'Administrar con el estómago vacío o antes de alimentos.';
  return 'Administrar según indicación médica. Verificar identidad del residente.';
}
