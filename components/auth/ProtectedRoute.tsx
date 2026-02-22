'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import type { AuthRole } from '@/types/auth';
import { ShieldX, ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function AuthSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md animate-pulse">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Authenticating…</p>
            </div>
        </div>
    );
}

// ─── Access Denied Page ───────────────────────────────────────────────────────
function AccessDenied({ userRole }: { userRole?: string }) {
    const { user } = useAuthStore();

    const stationMap: Record<string, string> = {
        MANAGER: '/dashboard/manager',
        FLOOR_LEAD: '/dashboard/floor',
        DOCTOR: '/dashboard/doctor',
        STAFF: '/dashboard/registration',
    };

    const stationUrl = stationMap[user?.role ?? ''] ?? '/auth/login';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            {/* Subtle grid watermark */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="relative max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-lg shadow-red-500/5 p-10 text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-t-2xl" />

                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
                    <ShieldX className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Restricted</h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-2">
                    This section requires elevated clearance.
                    {userRole && (
                        <> Your current role <span className="font-bold text-slate-700">({userRole})</span> does not have permission to view this zone.</>
                    )}
                </p>
                <p className="text-xs text-slate-400 mb-8">
                    If you believe this is a mistake, please contact your Hospital Manager.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={stationUrl}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold w-full sm:w-auto">
                            Return to Your Station
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button variant="outline" className="border-slate-200 text-slate-700 rounded-xl font-medium w-full sm:w-auto">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Change Role
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: AuthRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
        return <AuthSkeleton />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <AccessDenied userRole={user?.role} />;
    }

    return <>{children}</>;
}
