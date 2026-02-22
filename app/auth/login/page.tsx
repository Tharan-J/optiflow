'use client';

import { useState, useId, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { LOGIN_CONTEXTS } from '@/types/auth';
import { Activity, ShieldCheck, Eye, EyeOff, ChevronDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();

    const [email, setEmail] = useState(LOGIN_CONTEXTS[0].mockEmail || '');
    const [password, setPassword] = useState(LOGIN_CONTEXTS[0].mockPassword || '');
    const [contextKey, setContextKey] = useState(LOGIN_CONTEXTS[0].key);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const formId = useId();

    const selectedCtx = LOGIN_CONTEXTS.find((c) => c.key === contextKey)!;

    // Auto-fill credentials when role changes
    useEffect(() => {
        if (selectedCtx) {
            setEmail(selectedCtx.mockEmail || '');
            setPassword(selectedCtx.mockPassword || '');
            setError('');
        }
    }, [selectedCtx]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const redirectTo = await login(email, password, contextKey);
            router.push(redirectTo);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* ── Map Grid Watermark ── */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)
          `,
                    backgroundSize: '48px 48px',
                }}
            />

            {/* ── Soft glow ── */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

            {/* ── Navbar ── */}
            <header className="relative z-10 px-8 py-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-md flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-teal-900 tracking-tight">OptiFlow</span>
                </Link>
                <span className="text-xs text-slate-400 font-medium hidden sm:block">
                    Staff Medical Portal — Secured by OptiFlow Shield™
                </span>
            </header>

            {/* ── Main Card ── */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-md">

                    {/* Security Shield Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="relative flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200 shadow-lg shadow-emerald-500/10 flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                                {/* Pulse ring */}
                                <span className="absolute w-16 h-16 rounded-2xl border-2 border-emerald-400 animate-ping opacity-20" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                                Secure Medical Environment
                            </span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

                        <div className="p-8">
                            <div className="mb-7 text-center">
                                <h1 className="text-2xl font-extrabold text-teal-900 tracking-tight">Staff Portal Sign In</h1>
                                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                                    Select your role & zone, then authenticate.
                                </p>
                            </div>

                            {/* Error Banner */}
                            {error && (
                                <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5" id={formId}>

                                {/* ── Zone / Role Selector ── */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        Role & Zone
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={contextKey}
                                            onChange={(e) => setContextKey(e.target.value)}
                                            className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-teal-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
                                        >
                                            {LOGIN_CONTEXTS.map((ctx) => (
                                                <option key={ctx.key} value={ctx.key}>
                                                    {ctx.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>

                                    {/* Zone badge */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[11px] font-medium text-slate-400">Access zone:</span>
                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            {selectedCtx.zoneLabel}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400 ml-auto">
                                            {selectedCtx.permissions.length} permissions
                                        </span>
                                    </div>
                                </div>

                                {/* ── Email ── */}
                                <div className="space-y-1.5">
                                    <label htmlFor={`${formId}-email`} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <input
                                        id={`${formId}-email`}
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="doctor@optiflow.health"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* ── Password ── */}
                                <div className="space-y-1.5">
                                    <label htmlFor={`${formId}-password`} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id={`${formId}-password`}
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium pl-1">
                                        Auto-filled credentials for the selected role.
                                    </p>
                                </div>

                                {/* ── Permissions Preview ── */}
                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Access granted after login
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedCtx.permissions.map((p) => (
                                            <span
                                                key={p}
                                                className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md"
                                            >
                                                {p.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Submit ── */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className={cn(
                                        'w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 transition-all',
                                        isLoading && 'opacity-70 cursor-not-allowed'
                                    )}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Authenticating…
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" />
                                            Secure Sign In
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Footer Note */}
                            <p className="text-center text-xs text-slate-400 font-medium mt-6">
                                Patient? No login needed.{' '}
                                <Link href="/patient" className="text-emerald-600 font-semibold hover:underline">
                                    Track your token →
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 font-medium mt-6">
                        Protected by OptiFlow Shield™. HIPAA-compliant authentication.
                    </p>
                </div>
            </div>
        </div>
    );
}
