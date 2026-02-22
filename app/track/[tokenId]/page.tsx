'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useStore, Patient, Department, DilationData } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
    CheckCircle2, Clock, MapPin, AlertCircle, ChevronRight,
    Wifi, WifiOff, Bell, Map, Info, Eye, Pill, Stethoscope,
    UserCheck, FlaskConical, ShoppingBag, ArrowRight, Phone
} from 'lucide-react';

// ─── Zone Configuration ────────────────────────────────────────────────────────
interface ZoneConfig {
    id: Department;
    label: string;
    shortLabel: string;
    avgMinutes: number;
    room: string;
    floor: string;
    icon: React.ReactNode;
    instructions: string[];
    wayfinding: string;
}

const ZONE_CONFIGS: ZoneConfig[] = [
    {
        id: 'Registration',
        label: 'Registration',
        shortLabel: 'Reg.',
        avgMinutes: 5,
        room: 'Counter 1–4',
        floor: 'Ground Floor',
        icon: <UserCheck className="w-5 h-5" />,
        instructions: ['Please have your Aadhaar / ID ready.', 'Your token will be issued at the counter.'],
        wayfinding: 'Enter the main entrance, head straight to the registration counters on your left.',
    },
    {
        id: 'Refraction',
        label: 'Refraction',
        shortLabel: 'Refract.',
        avgMinutes: 12,
        room: 'Zone A, Rooms 1–6',
        floor: 'Ground Floor',
        icon: <Eye className="w-5 h-5" />,
        instructions: [
            'A technician will check your vision using a chart and an automated machine.',
            'Keep your glasses or contact lenses with you.',
            'Do not strain your eyes before the test.',
        ],
        wayfinding: 'From Reception, walk straight ahead past the waiting area. Refraction Zone is on your right.',
    },
    {
        id: 'Dilation',
        label: 'Dilation (Eye Drops)',
        shortLabel: 'Dilation',
        avgMinutes: 25,
        room: 'Dilation Lounge',
        floor: 'Ground Floor, Zone B',
        icon: <Pill className="w-5 h-5" />,
        instructions: [
            '⚠️  Your vision will be blurry and light-sensitive for 2–4 hours after drops.',
            '🚗  Do NOT drive after dilation. Arrange for a companion or cab.',
            '😎  Bring sunglasses — your eyes will be sensitive to bright light.',
            'Sit in the marked chairs. A nurse will call you when you\'re ready.',
        ],
        wayfinding: 'After Refraction, follow the green arrow signs to the Dilation Lounge. Seats are numbered.',
    },
    {
        id: 'Consultation',
        label: 'Doctor Consultation',
        shortLabel: 'Doctor',
        avgMinutes: 15,
        room: 'Consulting Rooms 101–108',
        floor: '1st Floor',
        icon: <Stethoscope className="w-5 h-5" />,
        instructions: [
            'The doctor will review your test results and conduct a detailed examination.',
            'Please mention all medications you are currently taking.',
            'Feel free to ask questions — write them down to remember.',
        ],
        wayfinding: 'Take the elevator or stairs to 1st Floor. Consulting rooms are straight ahead.',
    },
    {
        id: 'Tests',
        label: 'Diagnostics & Tests',
        shortLabel: 'Tests',
        avgMinutes: 20,
        room: 'Lab – Room 201',
        floor: '2nd Floor',
        icon: <FlaskConical className="w-5 h-5" />,
        instructions: [
            'Specialised imaging or field tests as advised by your doctor.',
            'You may need to sit still for a few minutes during scanning.',
        ],
        wayfinding: 'Take the elevator to 2nd Floor. Follow signs to the Diagnostics Lab.',
    },
    {
        id: 'Pharmacy',
        label: 'Pharmacy',
        shortLabel: 'Pharmacy',
        avgMinutes: 8,
        room: 'Pharmacy Counter',
        floor: 'Ground Floor, Exit Wing',
        icon: <ShoppingBag className="w-5 h-5" />,
        instructions: [
            'Collect your prescription medicines here.',
            'Ask the pharmacist about drop instillation technique if needed.',
            'Keep all medicine bills for insurance claims.',
        ],
        wayfinding: 'Walk towards the exit. Pharmacy is on the left, before the main door.',
    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatCountdown(targetISO: string): string {
    const diff = new Date(targetISO).getTime() - Date.now();
    if (diff <= 0) return '00:00';
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function addMinutes(iso: string, mins: number): string {
    return new Date(new Date(iso).getTime() + mins * 60000).toISOString();
}

function minutesAgo(iso?: string): number {
    if (!iso) return 0;
    return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Big live pulse dot in the header */
function LiveDot() {
    return (
        <span className="relative flex h-3.5 w-3.5" aria-hidden>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
        </span>
    );
}

/** Dilation countdown timer */
function DilationCountdown({ readyTime }: { readyTime: string }) {
    const [countdown, setCountdown] = useState(formatCountdown(readyTime));
    const isReady = new Date(readyTime) <= new Date();

    useEffect(() => {
        if (isReady) return;
        const t = setInterval(() => setCountdown(formatCountdown(readyTime)), 1000);
        return () => clearInterval(t);
    }, [readyTime, isReady]);

    if (isReady) {
        return (
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-5 py-3 w-full justify-center"
                role="status" aria-label="Eyes ready for examination">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-800 text-lg">Eyes Ready for Exam ✓</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-4 w-full"
            role="timer" aria-label={`Eyes ready in ${countdown}`}>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Eyes ready in</p>
                <p className="text-3xl font-black text-amber-800 font-mono leading-none mt-0.5" aria-live="polite">
                    {countdown}
                </p>
            </div>
            <span className="text-xs font-semibold text-amber-600 text-right leading-snug">
                Ready by<br />{formatTime(readyTime)}
            </span>
        </div>
    );
}

/** Pizza tracker step */
function TrackerStep({
    config, status, avgMinutes, isLast, queueAhead
}: {
    config: ZoneConfig;
    status: 'done' | 'current' | 'next' | 'future';
    avgMinutes: number;
    isLast: boolean;
    queueAhead?: number;
}) {
    const isDone = status === 'done';
    const isCurrent = status === 'current';
    const isNextUp = status === 'next';

    return (
        <div className="flex gap-4 items-start">
            {/* Dot + Line */}
            <div className="flex flex-col items-center shrink-0" style={{ width: 40 }}>
                <div
                    className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all',
                        isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isCurrent
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110'
                                : isNextUp
                                    ? 'bg-white border-emerald-300 text-emerald-500'
                                    : 'bg-white border-slate-200 text-slate-300'
                    )}
                    role="img"
                    aria-label={isDone ? `${config.label} completed` : isCurrent ? `Currently at ${config.label}` : `${config.label} upcoming`}
                >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : config.icon}
                </div>
                {!isLast && (
                    <div className={cn(
                        'w-0.5 mt-2 mb-1 rounded-full',
                        isDone ? 'bg-emerald-300 h-10' : 'bg-slate-200 h-10'
                    )} />
                )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-6 min-w-0', isLast && 'pb-0')}>
                <div className={cn(
                    'rounded-3xl p-5 border-2 shadow-sm transition-all',
                    isDone
                        ? 'bg-emerald-50 border-emerald-200'
                        : isCurrent
                            ? 'bg-white border-emerald-400 shadow-xl shadow-emerald-500/10'
                            : isNextUp
                                ? 'bg-white border-emerald-200'
                                : 'bg-white border-slate-100 opacity-60'
                )}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className={cn(
                                'font-extrabold text-xl leading-tight',
                                isDone ? 'text-emerald-800' :
                                    isCurrent ? 'text-slate-900' :
                                        isNextUp ? 'text-slate-700' : 'text-slate-400'
                            )}>
                                {config.label}
                            </h3>
                            <p className={cn(
                                'text-sm font-semibold mt-0.5',
                                isDone ? 'text-emerald-700' : 'text-slate-500'
                            )}>
                                {config.floor} · {config.room}
                            </p>
                        </div>
                        {isDone && (
                            <span className="shrink-0 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                                Done ✓
                            </span>
                        )}
                        {isCurrent && (
                            <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-full animate-pulse">
                                <LiveDot />
                                You're here
                            </span>
                        )}
                        {isNextUp && (
                            <span className="shrink-0 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                                Up Next
                            </span>
                        )}
                    </div>

                    {/* Current zone extras */}
                    {isCurrent && (
                        <div className="mt-4 space-y-2">
                            {typeof queueAhead === 'number' && (
                                <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                                    <span className="w-7 h-7 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-sm">
                                        {queueAhead}
                                    </span>
                                    {queueAhead === 0
                                        ? 'You\'re next! Get ready.'
                                        : queueAhead === 1
                                            ? '1 patient ahead of you'
                                            : `${queueAhead} patients ahead of you`}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-base font-semibold text-slate-600">
                                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                Avg. time here: ~{config.avgMinutes} minutes
                            </div>
                        </div>
                    )}

                    {/* Next up */}
                    {isNextUp && (
                        <p className="mt-2 text-sm text-slate-500 font-medium">
                            Avg. wait: ~{config.avgMinutes} min
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Floor Map Modal ───────────────────────────────────────────────────────────
function FloorMapModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Floor map"
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-extrabold text-xl text-slate-900">Floor Map</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg"
                        aria-label="Close map"
                    >
                        ×
                    </button>
                </div>
                {/* Simple schematic floor plan using SVG */}
                <div className="p-6">
                    <svg viewBox="0 0 340 300" className="w-full rounded-2xl bg-slate-50 border border-slate-200">
                        {/* Building outline */}
                        <rect x="10" y="10" width="320" height="280" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

                        {/* Ground floor zones */}
                        <rect x="20" y="20" width="90" height="60" rx="8" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="1.5" />
                        <text x="65" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill="#065f46">REGISTRATION</text>
                        <text x="65" y="58" textAnchor="middle" fontSize="8" fill="#047857">Counter 1–4</text>

                        <rect x="120" y="20" width="90" height="60" rx="8" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
                        <text x="165" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1e40af">REFRACTION</text>
                        <text x="165" y="58" textAnchor="middle" fontSize="8" fill="#2563eb">Zone A · R1–R6</text>

                        <rect x="220" y="20" width="100" height="60" rx="8" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="1.5" />
                        <text x="270" y="45" textAnchor="middle" fontSize="9" fontWeight="700" fill="#5b21b6">DILATION</text>
                        <text x="270" y="58" textAnchor="middle" fontSize="8" fill="#7c3aed">Lounge · Zone B</text>

                        {/* Separator line */}
                        <line x1="20" y1="100" x2="320" y2="100" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="6 3" />
                        <text x="170" y="112" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">1st FLOOR</text>

                        <rect x="20" y="120" width="140" height="60" rx="8" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
                        <text x="90" y="145" textAnchor="middle" fontSize="9" fontWeight="700" fill="#14532d">CONSULTATION</text>
                        <text x="90" y="158" textAnchor="middle" fontSize="8" fill="#166534">Rooms 101–108</text>

                        <rect x="180" y="120" width="140" height="60" rx="8" fill="#fef9c3" stroke="#fde047" strokeWidth="1.5" />
                        <text x="250" y="145" textAnchor="middle" fontSize="9" fontWeight="700" fill="#854d0e">DIAGNOSTICS</text>
                        <text x="250" y="158" textAnchor="middle" fontSize="8" fill="#92400e">Lab · Room 201</text>

                        {/* Separator line */}
                        <line x1="20" y1="200" x2="320" y2="200" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="6 3" />
                        <text x="170" y="212" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">GROUND · EXIT WING</text>

                        <rect x="20" y="222" width="100" height="55" rx="8" fill="#ccfbf1" stroke="#5eead4" strokeWidth="1.5" />
                        <text x="70" y="247" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f766e">PHARMACY</text>
                        <text x="70" y="260" textAnchor="middle" fontSize="8" fill="#0d9488">Near Exit</text>

                        {/* Lifts */}
                        <rect x="140" y="222" width="40" height="55" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                        <text x="160" y="247" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">LIFT</text>
                        <text x="160" y="260" textAnchor="middle" fontSize="8" fill="#94a3b8">⬆⬇</text>

                        {/* Entrance arrow */}
                        <polygon points="255,270 280,270 267,285" fill="#059669" />
                        <text x="267" y="268" textAnchor="middle" fontSize="8" fontWeight="700" fill="#059669">EXIT / ENTRANCE</text>
                    </svg>
                </div>
                <div className="px-6 pb-6">
                    <p className="text-sm text-slate-500 font-medium text-center">
                        📍 Ask staff at any counter for assistance
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Feedback Nudge Section ────────────────────────────────────────────────────
function FeedbackNudge({
    patient, minutesInZone, onFeedbackSent
}: {
    patient: Patient; minutesInZone: number; onFeedbackSent: () => void;
}) {
    const [sent, setSent] = useState(false);
    const showNudge = minutesInZone >= 40 && patient.currentDepartment === 'Dilation';

    if (!showNudge || sent) return null;

    const handleSend = () => {
        // In production: POST /api/feedback { tokenId: patient.token }
        // For now we mark as sent locally and log
        console.info('[OptiFlow] Patient nudge sent for token:', patient.token);
        setSent(true);
        onFeedbackSent();
    };

    return (
        <div
            className="rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-xl p-6 space-y-4"
            role="alert"
            aria-label="Long wait time notice"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h4 className="font-extrabold text-xl text-amber-900 leading-tight">
                        Been waiting a while?
                    </h4>
                    <p className="text-base text-amber-800 font-medium mt-1 leading-relaxed">
                        You've been in Dilation for over {minutesInZone} minutes. Tap below to
                        notify the floor team — they'll check on you shortly.
                    </p>
                </div>
            </div>
            <button
                onClick={handleSend}
                className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-extrabold text-lg shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                aria-label="Notify floor manager that you have been waiting a long time"
            >
                <Bell className="w-5 h-5" />
                I've been waiting a long time
            </button>
        </div>
    );
}

// ─── Not Found Screen ──────────────────────────────────────────────────────────
function NotFoundScreen({ tokenId }: { tokenId: string }) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Token Not Found</h1>
            <p className="text-lg text-slate-500 font-medium max-w-xs leading-relaxed mb-2">
                We couldn't find a patient with token:
            </p>
            <code className="text-xl font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-2xl font-mono mb-6">
                {tokenId}
            </code>
            <p className="text-base text-slate-500 font-medium max-w-xs leading-relaxed">
                Please ask a staff member at the registration counter to scan your QR code.
            </p>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 font-bold text-base">
                <Phone className="w-5 h-5" />
                Help Desk: 1800-XXX-XXXX
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PatientLiveTracker() {
    const params = useParams<{ tokenId: string }>();
    const tokenId = decodeURIComponent(params?.tokenId || '');

    const { patients } = useStore();
    const [now, setNow] = useState(new Date().toISOString());
    const [showMap, setShowMap] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));

    // Poll / auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date().toISOString());
            setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
        }, 30000);
        // Online/offline detection
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Find patient by token (case-insensitive)
    const patient = patients.find(p => p.token.toLowerCase() === tokenId.toLowerCase());

    if (!patient) {
        return <NotFoundScreen tokenId={tokenId} />;
    }

    // Build journey from patient data or default
    const journeyIds = patient.journey.length > 0
        ? patient.journey
        : (['Registration', 'Refraction', 'Dilation', 'Consultation', 'Pharmacy'] as Department[]);

    const currentIdx = journeyIds.indexOf(patient.currentDepartment);
    const minutesInZone = minutesAgo(patient.enteredZoneAt);

    // Queue ahead (# patients in same zone with earlier entry)
    const queueAhead = patients.filter(p =>
        p.id !== patient.id &&
        p.currentDepartment === patient.currentDepartment &&
        p.status !== 'COMPLETED' &&
        p.enteredZoneAt &&
        patient.enteredZoneAt &&
        new Date(p.enteredZoneAt) < new Date(patient.enteredZoneAt)
    ).length;

    // Estimated call-in time
    const currentZoneConfig = ZONE_CONFIGS.find(z => z.id === patient.currentDepartment);
    const avgTime = currentZoneConfig?.avgMinutes || 15;
    const estimatedCallIn = patient.enteredZoneAt
        ? addMinutes(patient.enteredZoneAt, avgTime * (queueAhead + 1))
        : '';

    // Dilation countdown
    const dilationReadyTime = patient.dilationData?.readyTime || (
        patient.currentDepartment === 'Dilation' && patient.enteredZoneAt
            ? addMinutes(patient.enteredZoneAt, 20)
            : null
    );

    return (
        <>
            {showMap && <FloorMapModal onClose={() => setShowMap(false)} />}

            <div
                className="min-h-screen bg-white font-sans"
                style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
            >
                {/* ─── Header ─────────────────────────────── */}
                <header
                    className="bg-white border-b-2 border-slate-100 sticky top-0 z-40 px-5 py-4"
                    role="banner"
                >
                    <div className="max-w-md mx-auto">
                        {/* Live status row */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <LiveDot />
                                <span className="text-base font-bold text-emerald-700 uppercase tracking-widest">
                                    Live Status
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isOnline ? (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                                        Updated {lastRefreshed}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                                        <WifiOff className="w-3.5 h-3.5" />
                                        Offline
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Token number — massive and bold */}
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Token</p>
                                <h1
                                    className="text-5xl font-black text-slate-900 leading-none tracking-tighter mt-1"
                                    aria-label={`Token number ${patient.token}`}
                                >
                                    {patient.token}
                                </h1>
                                <p className="text-base font-semibold text-slate-500 mt-1">{patient.name}</p>
                            </div>
                            {/* Complexity badge */}
                            <div className={cn(
                                'shrink-0 text-center px-4 py-2 rounded-2xl border-2 font-black text-base',
                                patient.complexityScore >= 8
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : patient.complexityScore >= 5
                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            )}>
                                {patient.complexityScore >= 8 ? '🔴' : patient.complexityScore >= 5 ? '🟡' : '🟢'}
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80">
                                    {patient.complexityScore >= 8 ? 'Priority' : patient.complexityScore >= 5 ? 'Standard' : 'Routine'}
                                </p>
                            </div>
                        </div>

                        {/* Current location badge */}
                        <div
                            className="mt-4 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-md shadow-emerald-500/20"
                            role="status"
                            aria-label={`Currently at ${currentZoneConfig?.label}`}
                        >
                            <MapPin className="w-5 h-5 shrink-0" aria-hidden />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Currently at</p>
                                <p className="text-lg font-extrabold leading-tight truncate">
                                    {currentZoneConfig?.label} · {currentZoneConfig?.room}
                                </p>
                            </div>
                            <ChevronRight className="w-5 h-5 opacity-60 shrink-0" aria-hidden />
                        </div>
                    </div>
                </header>

                {/* ─── Main Content ────────────────────────── */}
                <main className="max-w-md mx-auto px-5 py-6 space-y-6 pb-32">

                    {/* ── Dilation Countdown (if applicable) ── */}
                    {patient.currentDepartment === 'Dilation' && dilationReadyTime && (
                        <section aria-label="Dilation timer">
                            <DilationCountdown readyTime={dilationReadyTime} />
                        </section>
                    )}

                    {/* ── Info Cards ── */}
                    <section className="space-y-3" aria-label="Visit information">
                        {/* Estimated call-in */}
                        {estimatedCallIn && (
                            <div className="rounded-3xl bg-white border-2 border-slate-100 shadow-xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-500 uppercase tracking-wide text-xs">Expected call-in</p>
                                    <p className="text-2xl font-extrabold text-slate-900">{formatTime(estimatedCallIn)}</p>
                                    <p className="text-sm text-slate-500 font-medium">Based on current queue velocity</p>
                                </div>
                            </div>
                        )}

                        {/* Queue position */}
                        <div className="rounded-3xl bg-white border-2 border-slate-100 shadow-xl p-5 flex items-center gap-4">
                            <div className={cn(
                                'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border font-black text-2xl',
                                queueAhead === 0
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                                    : 'bg-slate-100 border-slate-200 text-slate-700'
                            )}>
                                {queueAhead}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Queue Position</p>
                                <p className="text-xl font-extrabold text-slate-900 leading-tight">
                                    {queueAhead === 0
                                        ? "You're next! 🎉"
                                        : queueAhead === 1
                                            ? '1 patient ahead of you'
                                            : `${queueAhead} patients ahead`}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">In {patient.currentDepartment}</p>
                            </div>
                        </div>

                        {/* Zone instructions */}
                        {currentZoneConfig && (
                            <div className="rounded-3xl bg-white border-2 border-emerald-100 shadow-xl p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden />
                                    <h2 className="text-base font-extrabold text-slate-900">Instructions for This Zone</h2>
                                </div>
                                <ul className="space-y-2.5" role="list">
                                    {currentZoneConfig.instructions.map((inst, i) => (
                                        <li key={i} className="flex items-start gap-3 text-lg text-slate-800 font-semibold leading-snug">
                                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                                                {i + 1}
                                            </span>
                                            {inst}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Wayfinding — next zone */}
                        {currentIdx < journeyIds.length - 1 && (
                            <div className="rounded-3xl bg-slate-50 border-2 border-slate-200 shadow-sm p-5 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">When Called Next</p>
                                    <p className="text-base font-bold text-slate-900 mt-0.5">
                                        Proceed to: {ZONE_CONFIGS.find(z => z.id === journeyIds[currentIdx + 1])?.label}
                                    </p>
                                    <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                                        {ZONE_CONFIGS.find(z => z.id === journeyIds[currentIdx + 1])?.wayfinding}
                                    </p>
                                    <button
                                        onClick={() => setShowMap(true)}
                                        className="mt-3 flex items-center gap-1.5 text-emerald-600 font-extrabold text-base underline underline-offset-2"
                                        aria-label="View floor map"
                                    >
                                        <Map className="w-4 h-4" />
                                        View Floor Map
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ── Pizza Tracker ── */}
                    <section aria-label="Your journey progress">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-extrabold text-slate-900">Your Journey</h2>
                            <span className="text-sm text-slate-400 font-bold">
                                {Math.max(0, currentIdx)} of {journeyIds.length} done
                            </span>
                        </div>

                        <div className="space-y-0">
                            {journeyIds.map((deptId, idx) => {
                                const cfg = ZONE_CONFIGS.find(z => z.id === deptId) || {
                                    id: deptId,
                                    label: deptId,
                                    shortLabel: deptId,
                                    avgMinutes: 10,
                                    room: '–',
                                    floor: '–',
                                    icon: <ChevronRight className="w-5 h-5" />,
                                    instructions: [],
                                    wayfinding: '',
                                };

                                const entry = patient.timeline.find(t => t.department === deptId);
                                let stepStatus: 'done' | 'current' | 'next' | 'future' = 'future';
                                if (entry?.status === 'done') stepStatus = 'done';
                                else if (entry?.status === 'current') stepStatus = 'current';
                                else if (idx === currentIdx + 1) stepStatus = 'next';

                                return (
                                    <TrackerStep
                                        key={deptId}
                                        config={cfg}
                                        status={stepStatus}
                                        avgMinutes={cfg.avgMinutes}
                                        isLast={idx === journeyIds.length - 1}
                                        queueAhead={stepStatus === 'current' ? queueAhead : undefined}
                                    />
                                );
                            })}
                        </div>
                    </section>

                    {/* ── Feedback Nudge (40+ min in Dilation) ── */}
                    <FeedbackNudge
                        patient={patient}
                        minutesInZone={minutesInZone}
                        onFeedbackSent={() => setFeedbackSent(true)}
                    />

                    {feedbackSent && (
                        <div className="rounded-3xl bg-emerald-50 border-2 border-emerald-200 p-5 flex items-center gap-3"
                            role="status" aria-live="polite">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                            <p className="text-base font-bold text-emerald-800">
                                Your message is sent. A floor staff member will check on you shortly.
                            </p>
                        </div>
                    )}

                    {/* ── Patient Info Strip ── */}
                    <div className="rounded-3xl bg-slate-50 border-2 border-slate-100 p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                            <UserCheck className="w-6 h-6 text-emerald-700" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patient</p>
                            <p className="text-lg font-extrabold text-slate-900">{patient.name}</p>
                            <p className="text-sm text-slate-500 font-medium">{patient.age} yrs · {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</p>
                        </div>
                    </div>

                    {/* Spacer for fixed bottom bar */}
                    <div className="h-4" />
                </main>

                {/* ─── Sticky Bottom Bar ─────────────────── */}
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t-2 border-slate-100 px-5 py-4 shadow-2xl">
                    <div className="max-w-md mx-auto flex gap-3">
                        <button
                            onClick={() => setShowMap(true)}
                            className="flex-1 h-14 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-[0.97] border-2 border-emerald-200 text-emerald-700 font-extrabold text-lg flex items-center justify-center gap-2 transition-all"
                            aria-label="View floor map"
                        >
                            <Map className="w-5 h-5" />
                            View Map
                        </button>
                        <a
                            href="tel:1800XXXXXXXX"
                            className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.97] border-2 border-slate-200 text-slate-600 flex items-center justify-center transition-all"
                            aria-label="Call help desk"
                        >
                            <Phone className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
