'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import {
    LayoutDashboard, Activity, ScanLine,
    Map as MapIcon, Stethoscope, ClipboardList,
    BrainCircuit, LogOut, ChevronDown, Shield, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthRole } from '@/types/auth';
import { useState } from 'react';

interface NavItem {
    name: string;
    icon: React.ElementType;
    href: string;
    roles: AuthRole[];
    badge?: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        name: 'Control Tower',
        icon: MapIcon,
        href: '/dashboard/manager',
        roles: ['MANAGER'],
        badge: 'Global',
    },
    {
        name: 'Floor Control',
        icon: LayoutDashboard,
        href: '/dashboard/floor',
        roles: ['MANAGER', 'FLOOR_LEAD'],
    },
    {
        name: 'Doctor Queue',
        icon: Stethoscope,
        href: '/dashboard/doctor',
        roles: ['MANAGER', 'DOCTOR'],
    },
    {
        name: 'Registration',
        icon: ClipboardList,
        href: '/dashboard/registration',
        roles: ['MANAGER', 'STAFF'],
    },
    {
        name: 'Flow Intelligence',
        icon: BrainCircuit,
        href: '/dashboard/intelligence',
        roles: ['MANAGER'],
        badge: 'AI',
    },
];

// Roles that can access the patient tracker quick-launch
const TRACKER_ROLES: AuthRole[] = ['MANAGER', 'FLOOR_LEAD', 'STAFF'];

const ROLE_LABELS: Record<AuthRole, string> = {
    MANAGER: 'Hospital Manager',
    FLOOR_LEAD: 'Floor Manager',
    DOCTOR: 'Doctor',
    STAFF: 'Registration Staff',
};

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [showZone, setShowZone] = useState(false);
    const [tokenInput, setTokenInput] = useState('');

    const role = user?.role ?? 'STAFF';
    const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(role));
    const canTrack = TRACKER_ROLES.includes(role);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const handleTrackerGo = () => {
        const token = tokenInput.trim().toUpperCase();
        if (!token) return;
        router.push(`/track/${encodeURIComponent(token)}`);
        setTokenInput('');
    };

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40">
            {/* Logo */}
            <div className="p-5 flex items-center gap-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
                    <Activity className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-teal-900 tracking-tight">OptiFlow</h1>
            </div>

            {/* User Context Card */}
            {user && (
                <div className="mx-3 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-emerald-800">{user.avatarInitials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{ROLE_LABELS[user.role]}</p>
                        </div>
                        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>

                    {/* Zone Badge */}
                    <button
                        onClick={() => setShowZone((v) => !v)}
                        className="mt-2 w-full flex items-center justify-between text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                        <span>📍 {user.zoneLabel}</span>
                        <ChevronDown className={cn('w-3 h-3 transition-transform', showZone && 'rotate-180')} />
                    </button>

                    {/* Zone Permissions Dropdown */}
                    {showZone && (
                        <div className="mt-1.5 space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Granted permissions</p>
                            {user.permissions.map((p) => (
                                <div key={p} className="text-[9px] font-medium text-teal-700 bg-white border border-teal-100 px-2 py-0.5 rounded-md">
                                    {p.replace(/_/g, ' ')}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto mt-3">
                <p className="text-[10px] font-bold text-slate-400 mb-2 px-2 uppercase tracking-widest">
                    Navigation
                </p>
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-sm font-medium',
                                isActive
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            <item.icon className={cn(
                                'w-4 h-4 shrink-0',
                                isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'
                            )} />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                                <span className={cn(
                                    'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide border',
                                    isActive
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                )}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Patient Tracker Quick-Launch */}
            {canTrack && (
                <div className="px-3 pb-3">
                    <p className="text-[10px] font-bold text-slate-400 mb-2 px-2 uppercase tracking-widest">
                        Patient Tracker
                    </p>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-300 transition-all">
                        <ScanLine className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={tokenInput}
                            onChange={e => setTokenInput(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleTrackerGo()}
                            placeholder="Token (e.g. A104)"
                            className="flex-1 bg-transparent text-xs font-semibold text-slate-700 placeholder:text-slate-400 outline-none min-w-0"
                            aria-label="Enter patient token to open Live Tracker"
                            maxLength={10}
                        />
                        <button
                            onClick={handleTrackerGo}
                            disabled={!tokenInput.trim()}
                            className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shrink-0"
                            aria-label="Open patient tracker"
                        >
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1.5 px-2">
                        Opens patient's live status page
                    </p>
                </div>
            )}

            {/* Logout */}
            <div className="p-3 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 text-sm font-semibold group"
                >
                    <LogOut className="w-4 h-4 shrink-0 group-hover:text-red-500" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
