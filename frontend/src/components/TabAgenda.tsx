import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useApp } from '@/store';
import { SectionTitle, Badge, KiroNote } from '@/components/ui';

export function TabAgenda() {
  const { dosis, residentes, medicamentos, personal, aplicarDosis, noAplicarDosis, user } = useApp();
  const [omissionModal, setOmissionModal] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [reporteGenerado, setReporteGenerado] = useState(false);

  // Get today's pending + applied doses for the morning shift
  const dosisTurno = useMemo(() => {
    return dosis.filter((d) => d.estado === 'pendiente' || d.estado === 'aplicada' || d.estado === 'no-aplicada');
  }, [dosis]);

  const pendientes = dosisTurno.filter((d) => d.estado === 'pendiente');
  const aplicadas = dosisTurno.filter((d) => d.estado === 'aplicada');
  const noAplicadas = dosisTurno.filter((d) => d.estado === 'no-aplicada');
  const total = dosisTurno.length;
  const completado = total > 0 ? Math.round((aplicadas.length / total) * 100) : 0;

  // Find next critical dose
  const proximaCritica = pendientes.find((d) => d.altaCriticidad);

  const getResidente = (id: string) => residentes.find((r) => r.id === id);
  const getMed = (id: string) => medicamentos.find((m) => m.id === id);
  const getPersonal = (id: string) => personal.find((p) => p.id === id);

  const handleNoAplicar = () => {
    if (omissionModal && motivo.trim()) {
      noAplicarDosis(omissionModal, motivo);
      setOmissionModal(null);
      setMotivo('');
    }
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle icon={<CalendarClock size={20} />} title="Agenda del Turno Matutino" subtitle="Ejecución diaria de dosis programadas" />

      {/* Critical alert banner */}
      {proximaCritica && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
            <Clock size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
              ⏰ Próxima dosis crítica en 15 min
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {getMed(proximaCritica.medicamentoId)?.nombre} — {getResidente(proximaCritica.residenteId)?.apodo}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {dosisTurno.map((d) => {
            const r = getResidente(d.residenteId);
            const m = getMed(d.medicamentoId);
            const p = getPersonal(d.cuidadorId);
            const isPendiente = d.estado === 'pendiente';
            const isAplicada = d.estado === 'aplicada';

            return (
              <div
                key={d.id}
                className={`card card-hover overflow-hidden ${
                  isAplicada ? 'ring-2 ring-emerald-300 dark:ring-emerald-700' : ''
                } ${d.estado === 'no-aplicada' ? 'ring-2 ring-red-300 dark:ring-red-700' : ''}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {r?.habitacion ?? '—'}
                    </span>
                  </div>
                  {d.altaCriticidad && isPendiente && <Badge color="red">Crítica</Badge>}
                  {isAplicada && <Badge color="green">Aplicada</Badge>}
                  {d.estado === 'no-aplicada' && <Badge color="red">Omitida</Badge>}
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
                      <Pill size={20} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{r?.apodo ?? '—'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m?.nombre} · {m?.via}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} /> {d.horaInicio}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User size={12} /> {p?.nombre ?? '—'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Activity size={12} /> {d.frecuencia}
                    </span>
                  </div>

                  {/* Kiro AI note */}
                  {isPendiente && (
                    <div className="mb-3">
                      <KiroNote>
                        Semaforito AI: {getKiroNote(m?.nombre ?? '', d.horaInicio)}
                      </KiroNote>
                    </div>
                  )}

                  {/* Applied banner */}
                  {isAplicada && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                      <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        Aplicada a las {d.horaAplicada} por {d.aplicadaPor}
                      </span>
                    </div>
                  )}

                  {d.estado === 'no-aplicada' && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
                      <XCircle size={16} className="text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">
                        No aplicada: {d.motivoOmision ?? 'Sin motivo'}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {isPendiente && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => aplicarDosis(d.id, user?.nombre ?? 'Cuidador')}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
                      >
                        <CheckCircle2 size={18} /> APLICADO
                      </button>
                      <button
                        onClick={() => setOmissionModal(d.id)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 px-3 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 active:scale-[0.98]"
                      >
                        <XCircle size={18} /> NO APLICADO
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
                  <circle
                    cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - completado / 100)}`}
                    className="text-emerald-500 transition-all duration-500"
                  />
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
                <span className="text-sm font-bold text-red-700 dark:text-red-300">{noAplicadas.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700/40">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{total}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setReporteGenerado(true);
                setTimeout(() => setReporteGenerado(false), 3000);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
            >
              <FileText size={16} /> Cerrar Turno y Generar Reporte
            </button>
            {reporteGenerado && (
              <p className="mt-2 animate-fade-in text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Reporte generado correctamente
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Alertas Activas</h3>
            <div className="space-y-2">
              {proximaCritica && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Dosis crítica pendiente: {getMed(proximaCritica.medicamentoId)?.nombre}
                  </p>
                </div>
              )}
              {pendientes.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-brand-50 p-3 dark:bg-brand-900/20">
                  <Clock size={16} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" />
                  <p className="text-xs text-brand-700 dark:text-brand-300">
                    {pendientes.length} dosis pendientes en el turno
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Omission modal */}
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
              placeholder="ej. Residente dormido / Rechazó medicamento / No disponible..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setOmissionModal(null); setMotivo(''); }} className="btn-ghost">
                Cancelar
              </button>
              <button
                onClick={handleNoAplicar}
                disabled={!motivo.trim()}
                className="btn-primary"
              >
                Confirmar Omisión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getKiroNote(medName: string, hora: string): string {
  const h = parseInt(hora);
  if (medName.toLowerCase().includes('insulina')) return 'Administrar antes del desayuno. Verificar glucemia capilar previa.';
  if (h < 8) return 'Administrar con el estómago vacío o antes de alimentos.';
  if (medName.toLowerCase().includes('oftálmica') || medName.toLowerCase().includes('gotas')) return 'Aplicar gotas en ojo derecho e izquierdo. Evitar contacto del gotero con el párpado.';
  if (medName.toLowerCase().includes('losartán') || medName.toLowerCase().includes('paracetamol')) return 'Administrar después de los alimentos con un vaso de agua.';
  return 'Administrar según indicación médica. Verificar identidad del residente.';
}
