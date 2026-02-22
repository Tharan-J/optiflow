import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, AuthRole, ZoneId, Permission } from '@/types/auth';
import { LOGIN_CONTEXTS } from '@/types/auth';

// ─── Mock Auth Service ────────────────────────────────────────────────────────
// In production this would call your actual API endpoint.
export async function mockLogin(
  email: string,
  password: string,
  contextKey: string
): Promise<AuthUser> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 900));

  const ctx = LOGIN_CONTEXTS.find((c) => c.key === contextKey);
  if (!ctx) throw new Error('Invalid context selected.');

  // Mock credential check
  if (email !== ctx.mockEmail || password !== ctx.mockPassword) {
    throw new Error(`Invalid credentials. Please use ${ctx.mockEmail} and ${ctx.mockPassword}`);
  }

  const namePart = email.split('@')[0];
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');

  return {
    id: `usr_${Math.random().toString(36).slice(2, 9)}`,
    name: displayName,
    email,
    role: ctx.role,
    zoneId: ctx.zoneId,
    zoneLabel: ctx.zoneLabel,
    permissions: ctx.permissions,
    avatarInitials: displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
  };
}

// ─── Zustand Auth Store ───────────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string, contextKey: string) => Promise<string>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: AuthRole[]) => boolean;
  isZoneAllowed: (zoneId: ZoneId) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password, contextKey) => {
        set({ isLoading: true });
        try {
          const user = await mockLogin(email, password, contextKey);
          const ctx = LOGIN_CONTEXTS.find((c) => c.key === contextKey)!;
          set({ user, isAuthenticated: true, isLoading: false });
          // Set a lightweight cookie so Next.js middleware can detect auth
          if (typeof document !== 'undefined') {
            document.cookie = 'optiflow-auth-active=1; path=/; SameSite=Lax';
          }
          return ctx.redirectTo;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear the middleware cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'optiflow-auth-active=; path=/; max-age=0';
        }
      },

      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions.includes(permission) ?? false;
      },

      hasRole: (roles) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      isZoneAllowed: (zoneId) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'MANAGER') return true; // global access
        return user.zoneId === zoneId || user.zoneId === 'GLOBAL';
      },
    }),
    {
      name: 'optiflow-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
