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
} from './types';
import { ROLE_TABS, backendUserToAuthUser } from './types';
import {
  seedMedicamentos,
  seedResidentes,
  seedPersonal,
  seedAsignaciones,
  seedDosis,
  seedBitacora,
} from './data';
import { authService } from '@/lib/authService';
import { usersService } from '@/lib/usersService';
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

  // Catálogos clínicos (en memoria)
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(seedMedicamentos);
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
