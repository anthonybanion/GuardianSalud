import { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/store';
import { SectionTitle, Field, Badge, EmptyState } from '@/components/ui';
import { DOSE_STATUS_LABEL } from '@/types';
import type { BackendDoseLog } from '@/types';

// ─── Helpers de fecha / hora ─────────────────────────────────────────────────

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function formatHora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

// Extrae solo la parte de fecha YYYY-MM-DD para comparar con el filtro
function isoToDateStr(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function TabBitacora() {
  const {
    doseLogs,
    doseLogsLoading,
    doseLogsError,
    fetchDoseLogs,
    staff,
    fetchStaff,
    medications,
    fetchMedications,
  } = useApp();

  // Filtros
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroStaff, setFiltroStaff] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    fetchDoseLogs();
    // Cargar staff y medications si están vacíos (para mostrar nombres)
    if (staff.length === 0) fetchStaff();
    if (medications.length === 0) fetchMedications();
  }, [fetchDoseLogs, fetchStaff, fetchMedications, staff.length, medications.length]);

  // Lookup helpers
  const getStaffName = (id: string) => {
    const s = staff.find((x) => x.id === id);
    return s?.user?.full_name ?? `Staff ${id.slice(0, 8)}`;
  };

  const getMedName = (log: BackendDoseLog) => {
    // La relación al medicamento viene a través del treatment_id
    // Si el backend no incluye relación anidada, mostramos el treatment_id corto
    return `Tratamiento ${log.treatment_id.slice(0, 8)}…`;
  };

  // Opciones de filtro dinámicas
  const staffOptions = useMemo(
    () => staff.map((s) => s.user?.full_name ?? s.id).filter(Boolean),
    [staff]
  );

  const ESTADO_OPTIONS = ['Aplicada', 'Omitida', 'Pendiente'];

  // Aplicar filtros
  const filtered = useMemo(() => {
    return doseLogs.filter((log) => {
      // Filtro fecha — comparar contra scheduled_at
      if (filtroFecha && isoToDateStr(log.scheduled_at) !== filtroFecha) return false;

      // Filtro estado
      if (filtroEstado) {
        const labelMap: Record<string, string> = {
          Aplicada: 'APPLIED',
          Omitida: 'OMITTED',
          Pendiente: 'PENDING',
        };
        if (log.status !== labelMap[filtroEstado]) return false;
      }

      // Filtro staff
      if (filtroStaff) {
        const s = staff.find((x) => x.id === log.staff_id);
        const nombre = s?.user?.full_name ?? '';
        if (nombre !== filtroStaff) return false;
      }

      return true;
    });
  }, [doseLogs, filtroFecha, filtroEstado, filtroStaff, staff]);

  const hayFiltros = filtroFecha || filtroEstado || filtroStaff;

  const limpiarFiltros = () => {
    setFiltroFecha('');
    setFiltroEstado('');
    setFiltroStaff('');
  };

  // Badge de estado
  const StatusBadge = ({ log }: { log: BackendDoseLog }) => {
    if (log.status === 'APPLIED') {
      return (
        <Badge color="green">
          <CheckCircle2 size={12} className="mr-1 inline" />
          Aplicada
        </Badge>
      );
    }
    if (log.status === 'OMITTED') {
      return (
        <Badge color="red">
          <XCircle size={12} className="mr-1 inline" />
          Omitida
        </Badge>
      );
    }
    return (
      <Badge color="amber">
        <Clock size={12} className="mr-1 inline" />
        Pendiente
      </Badge>
    );
  };

  return (
    <div className="animate-fade-in">
      <SectionTitle
        icon={<BookOpen size={20} />}
        title="Bitácora de Auditoría"
        subtitle="Historial completo de dosis aplicadas y omitidas"
      />

      {/* Filtros */}
      <div className="card mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Filtros
            </h3>
          </div>
          <button
            onClick={() => fetchDoseLogs()}
            className="btn-ghost py-1.5 text-xs"
            title="Recargar bitácora"
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Fecha */}
          <div>
            <label className="label-base">Fecha programada</label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="label-base">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input-base"
            >
              <option value="">Todos...</option>
              {ESTADO_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Staff */}
          <div>
            <label className="label-base">Cuidador / Staff</label>
            <select
              value={filtroStaff}
              onChange={(e) => setFiltroStaff(e.target.value)}
              className="input-base"
            >
              <option value="">Todos...</option>
              {staffOptions.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="mt-3 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Registros ({filtered.length}
            {hayFiltros ? ` de ${doseLogs.length}` : ''})
          </h3>
          {doseLogsLoading && (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          )}
        </div>

        {/* Error */}
        {doseLogsError && (
          <div className="px-5 py-3 text-sm text-red-600 dark:text-red-400">
            Error: {doseLogsError} —{' '}
            <button onClick={() => fetchDoseLogs()} className="underline">
              reintentar
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Hora prog.</th>
                <th className="px-5 py-3 font-semibold">Hora real</th>
                <th className="px-5 py-3 font-semibold">Tratamiento</th>
                <th className="px-5 py-3 font-semibold">Residente ID</th>
                <th className="px-5 py-3 font-semibold">Cuidador</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Motivo omisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {formatFecha(log.scheduled_at)}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {formatHora(log.scheduled_at)}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {log.administered_at ? formatHora(log.administered_at) : '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {log.treatment_id.slice(0, 8)}…
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {log.resident_id.slice(0, 8)}…
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {getStaffName(log.staff_id)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge log={log} />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {log.omission_reason ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!doseLogsLoading && filtered.length === 0 && (
            <EmptyState
              message={
                hayFiltros
                  ? 'No hay registros que coincidan con los filtros'
                  : 'No hay registros en la bitácora'
              }
            />
          )}
        </div>

        {/* Resumen rápido al pie */}
        {doseLogs.length > 0 && (
          <div className="flex flex-wrap gap-4 border-t border-slate-100 px-5 py-3 dark:border-slate-700/50">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: <strong className="text-slate-700 dark:text-slate-200">{doseLogs.length}</strong>
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Aplicadas:{' '}
              <strong>{doseLogs.filter((d) => d.status === 'APPLIED').length}</strong>
            </span>
            <span className="text-xs text-red-600 dark:text-red-400">
              ✗ Omitidas:{' '}
              <strong>{doseLogs.filter((d) => d.status === 'OMITTED').length}</strong>
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400">
              ⏳ Pendientes:{' '}
              <strong>{doseLogs.filter((d) => d.status === 'PENDING').length}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
