'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import type { AuthRole } from '@/types/auth';

const ALL_DASHBOARD_ROLES: AuthRole[] = ['MANAGER', 'FLOOR_LEAD', 'DOCTOR', 'STAFF'];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={ALL_DASHBOARD_ROLES}>
            <div className="min-h-screen flex text-foreground bg-slate-50">
                <Sidebar />
                <div className="flex-1 ml-64 flex flex-col min-h-screen">
                    <Topbar />
                    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
