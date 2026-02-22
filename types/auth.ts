// ─── Role Enum ────────────────────────────────────────────────────────────────
export type AuthRole =
  | 'MANAGER'      // Hospital Manager — global visibility
  | 'FLOOR_LEAD'   // Floor Manager — zone-scoped
  | 'DOCTOR'       // Doctor — patient list + clinical
  | 'STAFF';       // Registration staff — shadow triage

// ─── Zone / Floor Enum ────────────────────────────────────────────────────────
export type ZoneId =
  | 'GLOBAL'       // Manager-level, all floors
  | 'OPTIC-FL1'    // Ground Floor OPD
  | 'OPTIC-FL2'    // 1st Floor Surgical
  | 'OPTIC-FL3'    // 2nd Floor ICU/Recovery
  | 'OPTIC-REG'    // Registration Desk
  | 'OPTIC-CLIN';  // Consulting Rooms

// ─── Permission Flags ─────────────────────────────────────────────────────────
export type Permission =
  | 'VIEW_GLOBAL_STATS'
  | 'VIEW_FLOOR_STATS'
  | 'MANAGE_ROUTING'
  | 'VIEW_INTELLIGENCE'
  | 'VIEW_PATIENT_LIST'
  | 'COMPLETE_CONSULTATION'
  | 'REGISTER_PATIENT'
  | 'VIEW_DIGITAL_TWIN'
  | 'SWITCH_ZONE';

// ─── Authenticated User ───────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  zoneId: ZoneId;
  zoneLabel: string;
  permissions: Permission[];
  avatarInitials: string;
}

// ─── Login Credential Payload ─────────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
  contextKey: string; // e.g., "MANAGER|GLOBAL"
}

// ─── Login Context Options (shown in selector) ────────────────────────────────
export interface LoginContext {
  key: string;          // "MANAGER|GLOBAL"
  label: string;        // "Hospital Manager — Global View"
  role: AuthRole;
  zoneId: ZoneId;
  zoneLabel: string;
  permissions: Permission[];
  redirectTo: string;
  mockEmail?: string;
  mockPassword?: string;
}

// ─── Pre-defined login contexts (used by mock auth) ──────────────────────────
export const LOGIN_CONTEXTS: LoginContext[] = [
  {
    key: 'MANAGER|GLOBAL',
    label: 'Hospital Manager — Global View',
    role: 'MANAGER',
    zoneId: 'GLOBAL',
    zoneLabel: 'All Floors',
    redirectTo: '/dashboard/manager',
    permissions: [
      'VIEW_GLOBAL_STATS', 'VIEW_FLOOR_STATS', 'MANAGE_ROUTING',
      'VIEW_INTELLIGENCE', 'VIEW_PATIENT_LIST', 'VIEW_DIGITAL_TWIN', 'SWITCH_ZONE',
    ],
    mockEmail: 'manager@optiflow.com',
    mockPassword: 'password123',
  },
  {
    key: 'FLOOR_LEAD|OPTIC-FL1',
    label: 'Floor Manager — Ground Floor OPD',
    role: 'FLOOR_LEAD',
    zoneId: 'OPTIC-FL1',
    zoneLabel: 'Ground Floor OPD',
    redirectTo: '/dashboard/floor',
    permissions: [
      'VIEW_FLOOR_STATS', 'MANAGE_ROUTING', 'VIEW_PATIENT_LIST', 'SWITCH_ZONE',
    ],
    mockEmail: 'floor@optiflow.com',
    mockPassword: 'password123',
  },
  {
    key: 'FLOOR_LEAD|OPTIC-FL2',
    label: 'Floor Manager — 1st Floor Surgical',
    role: 'FLOOR_LEAD',
    zoneId: 'OPTIC-FL2',
    zoneLabel: '1st Floor Surgical',
    redirectTo: '/dashboard/floor',
    permissions: [
      'VIEW_FLOOR_STATS', 'MANAGE_ROUTING', 'VIEW_PATIENT_LIST', 'SWITCH_ZONE',
    ],
    mockEmail: 'surgical@optiflow.com',
    mockPassword: 'password123',
  },
  {
    key: 'DOCTOR|OPTIC-CLIN',
    label: 'Doctor — Consulting Rooms',
    role: 'DOCTOR',
    zoneId: 'OPTIC-CLIN',
    zoneLabel: 'Consulting Rooms',
    redirectTo: '/dashboard/doctor',
    permissions: [
      'VIEW_PATIENT_LIST', 'COMPLETE_CONSULTATION', 'VIEW_FLOOR_STATS',
    ],
    mockEmail: 'doctor@optiflow.com',
    mockPassword: 'password123',
  },
  {
    key: 'STAFF|OPTIC-REG',
    label: 'Registration Desk — Shadow Triage',
    role: 'STAFF',
    zoneId: 'OPTIC-REG',
    zoneLabel: 'Registration Desk',
    redirectTo: '/dashboard/registration',
    permissions: [
      'REGISTER_PATIENT', 'VIEW_PATIENT_LIST',
    ],
    mockEmail: 'staff@optiflow.com',
    mockPassword: 'password123',
  },
];

// ─── Route permission map ─────────────────────────────────────────────────────
export const ROUTE_PERMISSIONS: Record<string, AuthRole[]> = {
  '/dashboard/manager':      ['MANAGER'],
  '/dashboard/floor':        ['MANAGER', 'FLOOR_LEAD'],
  '/dashboard/doctor':       ['MANAGER', 'DOCTOR'],
  '/dashboard/registration': ['MANAGER', 'STAFF'],
  '/dashboard/intelligence': ['MANAGER'],
};
