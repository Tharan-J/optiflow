'use client';

import { useAuthStore } from '@/lib/auth-store';
import { Bell, Search, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ROLE_DISPLAY: Record<string, string> = {
    MANAGER: 'Hospital Manager',
    FLOOR_LEAD: 'Floor Manager',
    DOCTOR: 'Doctor',
    STAFF: 'Reg. Staff',
};

export function Topbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    return (
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md shadow-sm">
            {/* Search */}
            <div className="relative w-80 hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search patient token, PRN..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400 transition-all font-medium"
                />
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Zone indicator */}
                {user && (
                    <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-slate-500">{ROLE_DISPLAY[user.role] ?? user.role}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-emerald-700">{user.zoneLabel}</span>
                    </div>
                )}

                {/* Bell */}
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors relative border border-slate-200">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white" />
                </button>

                {/* Avatar + name */}
                {user && (
                    <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-xs font-bold text-slate-800">{user.name}</span>
                            <span className="text-[10px] text-slate-400">{user.email}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-200 border border-emerald-300 flex items-center justify-center cursor-pointer" title={`${user.name} · ${user.role}`}>
                            <span className="text-[10px] font-bold text-emerald-800">{user.avatarInitials}</span>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200 text-slate-500"
                >
                    <LogOut className="w-3.5 h-3.5" />
                </button>
            </div>
        </header>
    );
}
