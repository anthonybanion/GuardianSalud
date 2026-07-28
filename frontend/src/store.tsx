import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Theme,
  MainTab,
  Medicamento,
  Residente,
  Personal,
  AsignacionTurno,
  Dosis,
  BitacoraEntry,
  AuthUser,
  BackendUser,
  BackendStaff,
  CreateStaffDto,
  UpdateStaffDto,
  BackendMedication,
  CreateMedicationDto,
  UpdateMedicationDto,
  BackendDoseLog,
  CreateDoseLogDto,
  UpdateDoseLogDto,
  BackendTreatment,
  CreateTreatmentDto,
  UpdateTreatmentDto,
  BackendShiftAssignment,
  CreateShiftAssignmentDto,
  UpdateShiftAssignmentDto,
  BackendResident,
  CreateResidentDto,
} from './types';
import { ROLE_TABS, backendUserToAuthUser } from './types';
import {
  seedResidentes,
  seedPersonal,
  seedAsignaciones,
  seedDosis,
  seedBitacora,
} from './data';
import { authService } from '@/lib/authService';
import { usersService } from '@/lib/usersService';
import { staffService } from '@/lib/staffService';
import { medicationsService } from '@/lib/medicationsService';
import { doseLogsService } from '@/lib/doseLogsService';
import { treatmentsService } from '@/lib/treatmentsService';
import { shiftAssignmentsService } from '@/lib/shiftAssignmentsService';
import { residentsService } from '@/lib/residentsService';
import { getToken, clearToken } from '@/lib/api';
import type { CreateUserDto, UpdateUserDto } from '@/lib/usersService';

// ─── AppState interface ───────────────────────────────────────────────────────

interface AppState {
  // UI
  theme: Theme;
  toggleTheme: () => void;
  activeTab: MainTab;
  setActiveTab: (t: MainTab) => void;

  // Auth
  user: AuthUser | null;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  allowedTabs: MainTab[];

  // Gestión de usuarios (admin only)
  backendUsers: BackendUser[];
  usersLoading: boolean;
  usersError: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (dto: CreateUserDto) => Promise<void>;
  updateUser: (id: string, dto: UpdateUserDto) => Promise<void>;
  removeUser: (id: string) => Promise<void>;

  // Staff — Personal / Cuidadores (conectado a /staff)
  staff: BackendStaff[];
  staffLoading: boolean;
  staffError: string | null;
  fetchStaff: () => Promise<void>;
  createStaff: (dto: CreateStaffDto) => Promise<BackendStaff>;
  updateStaff: (id: string, dto: UpdateStaffDto) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;

  // Medications — Medicamentos / Insumos (conectado a /medications)
  medications: BackendMedication[];
  medicationsLoading: boolean;
  medicationsError: string | null;
  fetchMedications: () => Promise<void>;
  createMedication: (dto: CreateMedicationDto) => Promise<BackendMedication>;
  updateMedication: (id: string, dto: UpdateMedicationDto) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;

  // Dose Logs — Bitácora (conectado a /dose-logs)
  doseLogs: BackendDoseLog[];
  doseLogsLoading: boolean;
  doseLogsError: string | null;
  fetchDoseLogs: () => Promise<void>;
  createDoseLog: (dto: CreateDoseLogDto) => Promise<BackendDoseLog>;
  updateDoseLog: (id: string, dto: UpdateDoseLogDto) => Promise<void>;
  removeDoseLog: (id: string) => Promise<void>;

  // Treatments — Asignar Dosis (conectado a /treatments)
  treatments: BackendTreatment[];
  treatmentsLoading: boolean;
  treatmentsError: string | null;
  fetchTreatments: () => Promise<void>;
  createTreatment: (dto: CreateTreatmentDto) => Promise<BackendTreatment>;
  updateTreatment: (id: string, dto: UpdateTreatmentDto) => Promise<void>;
  removeTreatment: (id: string) => Promise<void>;

  // Shift Assignments — Cuidadores y Turnos (conectado a /shift-assignments)
  shiftAssignments: BackendShiftAssignment[];
  shiftAssignmentsLoading: boolean;
  shiftAssignmentsError: string | null;
  fetchShiftAssignments: () => Promise<void>;
  createShiftAssignment: (dto: CreateShiftAssignmentDto) => Promise<BackendShiftAssignment>;
  updateShiftAssignment: (id: string, dto: UpdateShiftAssignmentDto) => Promise<void>;
  removeShiftAssignment: (id: string) => Promise<void>;

  // Residents (backend /residents)
  backendResidents: BackendResident[];
  residentsLoading: boolean;
  fetchResidents: () => Promise<void>;

  // Catálogos clínicos (en memoria hasta integrar endpoints)
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

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppState | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

let idCounter = 1000;
const genId = (prefix: string) => `${prefix}-${++idCounter}`;

const THEME_KEY = 'guardiansalud_theme';
const SESSION_KEY = 'guardiansalud_session';

// ─── AppProvider ──────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  // UI state
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(THEME_KEY) as Theme) || 'light';
  });
  const [activeTab, setActiveTab] = useState<MainTab>('registros');

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Usuarios backend state
  const [backendUsers, setBackendUsers] = useState<BackendUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Staff state
  const [staff, setStaff] = useState<BackendStaff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Medications state
  const [medications, setMedications] = useState<BackendMedication[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState(false);
  const [medicationsError, setMedicationsError] = useState<string | null>(null);

  // Dose Logs state
  const [doseLogs, setDoseLogs] = useState<BackendDoseLog[]>([]);
  const [doseLogsLoading, setDoseLogsLoading] = useState(false);
  const [doseLogsError, setDoseLogsError] = useState<string | null>(null);

  // Treatments state
  const [treatments, setTreatments] = useState<BackendTreatment[]>([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(false);
  const [treatmentsError, setTreatmentsError] = useState<string | null>(null);

  // Shift Assignments state
  const [shiftAssignments, setShiftAssignments] = useState<BackendShiftAssignment[]>([]);
  const [shiftAssignmentsLoading, setShiftAssignmentsLoading] = useState(false);
  const [shiftAssignmentsError, setShiftAssignmentsError] = useState<string | null>(null);

  // Residents state (backend /residents)
  const [backendResidents, setBackendResidents] = useState<BackendResident[]>([]);
  const [residentsLoading, setResidentsLoading] = useState(false);

  // Catálogos clínicos en memoria (residentes y personal legacy — pendiente migrar)
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [residentes, setResidentes] = useState<Residente[]>(seedResidentes);
  const [personal, setPersonal] = useState<Personal[]>(seedPersonal);
  const [asignaciones, setAsignaciones] = useState<AsignacionTurno[]>(seedAsignaciones);
  const [dosis, setDosis] = useState<Dosis[]>(seedDosis);
  const [bitacora, setBitacora] = useState<BitacoraEntry[]>(seedBitacora);

  const allowedTabs = user ? ROLE_TABS[user.role] : [];

  // ── Tema ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // ── Restaurar sesión al montar (si hay token válido en localStorage) ───────

  useEffect(() => {
    const token = getToken();
    if (!token || user) return; // ya hay sesión restaurada o no hay token

    authService.me()
      .then((backendUser) => {
        const authUser = backendUserToAuthUser(backendUser);
        setUser(authUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
        setActiveTab(ROLE_TABS[authUser.role][0]);
      })
      .catch(() => {
        // Token expirado o inválido → limpiar todo
        clearToken();
        localStorage.removeItem(SESSION_KEY);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const backendUser = await authService.login({ email, password });
      const authUser = backendUserToAuthUser(backendUser);
      setUser(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      setActiveTab(ROLE_TABS[authUser.role][0]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setAuthError(message);
      throw err; // re-throw para que LoginScreen pueda reaccionar
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    setActiveTab('registros');
    setBackendUsers([]);
    setStaff([]);
  }, []);

  // ── Usuarios backend ──────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const users = await usersService.getAll();
      setBackendUsers(users);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const createUser = useCallback(async (dto: CreateUserDto) => {
    const newUser = await usersService.create(dto);
    setBackendUsers((prev) => [newUser, ...prev]);
  }, []);

  const updateUser = useCallback(async (id: string, dto: UpdateUserDto) => {
    const updated = await usersService.update(id, dto);
    setBackendUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  }, []);

  const removeUser = useCallback(async (id: string) => {
    await usersService.remove(id);
    setBackendUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // ── Staff ─────────────────────────────────────────────────────────────────

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const data = await staffService.getAll();
      setStaff(data);
    } catch (err) {
      setStaffError(err instanceof Error ? err.message : 'Error al cargar personal');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const createStaff = useCallback(async (dto: CreateStaffDto): Promise<BackendStaff> => {
    const created = await staffService.create(dto);
    setStaff((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateStaff = useCallback(async (id: string, dto: UpdateStaffDto) => {
    const updated = await staffService.update(id, dto);
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const removeStaff = useCallback(async (id: string) => {
    await staffService.remove(id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Medications ───────────────────────────────────────────────────────────

  const fetchMedications = useCallback(async () => {
    setMedicationsLoading(true);
    setMedicationsError(null);
    try {
      const data = await medicationsService.getAll();
      setMedications(data);
    } catch (err) {
      setMedicationsError(err instanceof Error ? err.message : 'Error al cargar medicamentos');
    } finally {
      setMedicationsLoading(false);
    }
  }, []);

  const createMedication = useCallback(async (dto: CreateMedicationDto): Promise<BackendMedication> => {
    const created = await medicationsService.create(dto);
    setMedications((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateMedication = useCallback(async (id: string, dto: UpdateMedicationDto) => {
    const updated = await medicationsService.update(id, dto);
    setMedications((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);

  const removeMedication = useCallback(async (id: string) => {
    await medicationsService.remove(id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // ── Dose Logs ─────────────────────────────────────────────────────────────

  const fetchDoseLogs = useCallback(async () => {
    setDoseLogsLoading(true);
    setDoseLogsError(null);
    try {
      const data = await doseLogsService.getAll();
      setDoseLogs(data);
    } catch (err) {
      setDoseLogsError(err instanceof Error ? err.message : 'Error al cargar bitácora');
    } finally {
      setDoseLogsLoading(false);
    }
  }, []);

  const createDoseLog = useCallback(async (dto: CreateDoseLogDto): Promise<BackendDoseLog> => {
    const created = await doseLogsService.create(dto);
    setDoseLogs((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateDoseLog = useCallback(async (id: string, dto: UpdateDoseLogDto) => {
    const updated = await doseLogsService.update(id, dto);
    setDoseLogs((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  const removeDoseLog = useCallback(async (id: string) => {
    await doseLogsService.remove(id);
    setDoseLogs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ── Treatments ────────────────────────────────────────────────────────────

  const fetchTreatments = useCallback(async () => {
    setTreatmentsLoading(true);
    setTreatmentsError(null);
    try {
      const data = await treatmentsService.getAll();
      setTreatments(data);
    } catch (err) {
      setTreatmentsError(err instanceof Error ? err.message : 'Error al cargar tratamientos');
    } finally {
      setTreatmentsLoading(false);
    }
  }, []);

  const createTreatment = useCallback(async (dto: CreateTreatmentDto): Promise<BackendTreatment> => {
    const created = await treatmentsService.create(dto);
    setTreatments((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTreatment = useCallback(async (id: string, dto: UpdateTreatmentDto) => {
    const updated = await treatmentsService.update(id, dto);
    setTreatments((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const removeTreatment = useCallback(async (id: string) => {
    await treatmentsService.remove(id);
    setTreatments((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Shift Assignments ─────────────────────────────────────────────────────

  const fetchShiftAssignments = useCallback(async () => {
    setShiftAssignmentsLoading(true);
    setShiftAssignmentsError(null);
    try {
      const data = await shiftAssignmentsService.getAll();
      setShiftAssignments(data);
    } catch (err) {
      setShiftAssignmentsError(
        err instanceof Error ? err.message : 'Error al cargar turnos',
      );
    } finally {
      setShiftAssignmentsLoading(false);
    }
  }, []);

  const createShiftAssignment = useCallback(
    async (dto: CreateShiftAssignmentDto): Promise<BackendShiftAssignment> => {
      const created = await shiftAssignmentsService.create(dto);
      setShiftAssignments((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateShiftAssignment = useCallback(
    async (id: string, dto: UpdateShiftAssignmentDto) => {
      const updated = await shiftAssignmentsService.update(id, dto);
      setShiftAssignments((prev) =>
        prev.map((s) => (s.id === id ? updated : s)),
      );
    },
    [],
  );

  const removeShiftAssignment = useCallback(async (id: string) => {
    await shiftAssignmentsService.remove(id);
    setShiftAssignments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Residents (backend) ───────────────────────────────────────────────────

  const fetchResidents = useCallback(async () => {
    setResidentsLoading(true);
    try {
      const data = await residentsService.getAll();
      setBackendResidents(data);
    } catch { /* silencioso */ }
    finally { setResidentsLoading(false); }
  }, []);

  // ── Catálogos clínicos (en memoria) ──────────────────────────────────────

  const addMedicamento: AppState['addMedicamento'] = (m) => {
    setMedicamentos((prev) => [
      { ...m, id: genId('med'), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addResidente: AppState['addResidente'] = (r) => {
    setResidentes((prev) => [
      { ...r, id: genId('res'), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addPersonal: AppState['addPersonal'] = (p) => {
    setPersonal((prev) => [
      { ...p, id: genId('per'), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addAsignacion: AppState['addAsignacion'] = (a) => {
    setAsignaciones((prev) => [{ ...a, id: genId('asg') }, ...prev]);
  };

  const addDosis: AppState['addDosis'] = (d) => {
    setDosis((prev) => [
      { ...d, id: genId('dos'), estado: 'pendiente', createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const pushBitacora = (entry: Omit<BitacoraEntry, 'id'>) => {
    setBitacora((prev) => [{ ...entry, id: genId('bit') }, ...prev]);
  };

  const aplicarDosis: AppState['aplicarDosis'] = (id, aplicadaPor) => {
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5);
    const fecha = now.toISOString().slice(0, 10);
    setDosis((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, estado: 'aplicada', horaAplicada: hora, aplicadaPor } : d
      )
    );
    const d = dosis.find((x) => x.id === id);
    if (d) {
      pushBitacora({
        fecha,
        residenteId: d.residenteId,
        medicamentoId: d.medicamentoId,
        cuidadorId: d.cuidadorId,
        estado: 'aplicada',
        hora,
      });
    }
  };

  const noAplicarDosis: AppState['noAplicarDosis'] = (id, motivo) => {
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5);
    const fecha = now.toISOString().slice(0, 10);
    setDosis((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, estado: 'no-aplicada', motivoOmision: motivo } : d
      )
    );
    const d = dosis.find((x) => x.id === id);
    if (d) {
      pushBitacora({
        fecha,
        residenteId: d.residenteId,
        medicamentoId: d.medicamentoId,
        cuidadorId: d.cuidadorId,
        estado: 'no-aplicada',
        hora,
        nota: motivo,
      });
    }
  };

  // ── Valor del contexto ────────────────────────────────────────────────────

  const value: AppState = {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,

    user,
    authLoading,
    authError,
    login,
    logout,
    allowedTabs,

    backendUsers,
    usersLoading,
    usersError,
    fetchUsers,
    createUser,
    updateUser,
    removeUser,

    staff,
    staffLoading,
    staffError,
    fetchStaff,
    createStaff,
    updateStaff,
    removeStaff,

    medications,
    medicationsLoading,
    medicationsError,
    fetchMedications,
    createMedication,
    updateMedication,
    removeMedication,

    doseLogs,
    doseLogsLoading,
    doseLogsError,
    fetchDoseLogs,
    createDoseLog,
    updateDoseLog,
    removeDoseLog,

    treatments,
    treatmentsLoading,
    treatmentsError,
    fetchTreatments,
    createTreatment,
    updateTreatment,
    removeTreatment,

    shiftAssignments,
    shiftAssignmentsLoading,
    shiftAssignmentsError,
    fetchShiftAssignments,
    createShiftAssignment,
    updateShiftAssignment,
    removeShiftAssignment,

    backendResidents,
    residentsLoading,
    fetchResidents,

    medicamentos,
    addMedicamento,
    residentes,
    addResidente,
    personal,
    addPersonal,

    asignaciones,
    addAsignacion,
    dosis,
    addDosis,
    aplicarDosis,
    noAplicarDosis,

    bitacora,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
