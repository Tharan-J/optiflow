'use client';

import { useState } from 'react';
import { useStore, Patient, Department } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertTriangle, ArrowRightLeft, Settings2, ChevronDown, ChevronRight,
    User, Clock, CheckCircle2, Circle, ArrowRight, SkipForward, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MasterPatientSidebar } from '@/components/clinical/MasterPatientSidebar';

// ─── Types ─────────────────────────────────────────────────────────────────────
const DEPT_COLORS: Record<Department, { bg: string; badge: string; ring: string, text: string }> = {
    Registration: { bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-700 border-slate-200', ring: 'ring-slate-300', text: 'text-slate-700' },
    Refraction: { bg: 'bg-sky-50', badge: 'bg-sky-100 text-sky-700 border-sky-200', ring: 'ring-sky-300', text: 'text-sky-700' },
    Dilation: { bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700 border-violet-200', ring: 'ring-violet-300', text: 'text-violet-700' },
    Consultation: { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', ring: 'ring-emerald-300', text: 'text-emerald-700' },
    Tests: { bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700 border-amber-200', ring: 'ring-amber-300', text: 'text-amber-700' },
    Counseling: { bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700 border-orange-200', ring: 'ring-orange-300', text: 'text-orange-700' },
    Pharmacy: { bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700 border-teal-200', ring: 'ring-teal-300', text: 'text-teal-700' },
};

function formatMinutes(iso?: string) {
    if (!iso) return 0;
    return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

// ─── Patient Path Strip ────────────────────────────────────────────────────────
function DynamicPath({ patient }: { patient: Patient }) {
    return (
        <div className="flex items-center gap-1 flex-wrap mt-2">
            {patient.journey.map((dept, i) => {
                const entry = patient.timeline.find(t => t.department === dept);
                const status = entry?.status || 'next';
                return (
                    <div key={dept} className="flex items-center gap-1">
                        <span className={cn(
                            'text-[10px] px-2 py-0.5 rounded-md font-bold border',
                            status === 'done' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                status === 'current' ? 'bg-sky-100 text-sky-800 border-sky-300 ring-1 ring-sky-400 animate-pulse' :
                                    status === 'skipped' ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' :
                                        'bg-white text-slate-400 border-slate-200'
                        )}>
                            {dept}
                        </span>
                        {i < patient.journey.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Patient Mini Card ─────────────────────────────────────────────────────────
function PatientMiniCard({
    patient, onSelect, onReroute
}: {
    patient: Patient;
    onSelect: () => void;
    onReroute: (skip: Department) => void;
}) {
    const mins = formatMinutes(patient.enteredZoneAt);
    const isOverdue = mins > 30;

    // Find next zone for reroute
    const currentIdx = patient.journey.indexOf(patient.currentDepartment);
    const nextDept = patient.journey[currentIdx + 1];

    return (
        <div className={cn(
            'p-3.5 rounded-xl border transition-all',
            isOverdue
                ? 'border-amber-300 bg-amber-50 shadow-[0_0_0_2px_rgba(251,191,36,.3)] animate-[pulse_2s_ease-in-out_infinite]'
                : 'border-slate-200 bg-white hover:border-slate-300'
        )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{patient.name}</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{patient.token}</span>
                        {patient.complexityScore >= 8 && (
                            <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className={cn('w-3 h-3', isOverdue ? 'text-amber-600' : 'text-slate-400')} />
                        <span className={cn('text-[11px] font-bold', isOverdue ? 'text-amber-700' : 'text-slate-500')}>
                            {mins} min{isOverdue && ' ⚠ Overdue'}
                        </span>
                    </div>
                    <DynamicPath patient={patient} />
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onSelect}
                        className="h-7 text-[11px] px-2.5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                    >
                        <User className="w-3 h-3 mr-1" /> View
                    </Button>
                    {nextDept && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReroute(nextDept)}
                            className="h-7 text-[11px] px-2.5 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                        >
                            <SkipForward className="w-3 h-3 mr-1" /> Skip
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Zone Control Card ─────────────────────────────────────────────────────────
function ZoneControlCard({
    dept, patients, onSelectPatient, onReroute
}: {
    dept: Department;
    patients: Patient[];
    onSelectPatient: (p: Patient) => void;
    onReroute: (patientId: string, skip: Department) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const colors = DEPT_COLORS[dept];
    const waiting = patients.filter(p => p.status === 'WAITING');
    const inProgress = patients.filter(p => p.status === 'IN_PROGRESS');
    const avgWait = waiting.length > 0
        ? Math.floor(waiting.reduce((a, p) => a + (p.estimatedWaitTime || 0), 0) / waiting.length)
        : 0;
    const hasOverdue = patients.some(p => formatMinutes(p.enteredZoneAt) > 30);
    const riskLevel = avgWait > 30 ? 'high' : avgWait > 15 ? 'med' : 'low';

    return (
        <div className={cn(
            'rounded-xl border overflow-hidden transition-all',
            hasOverdue ? 'border-amber-300' :
                riskLevel === 'high' ? 'border-red-200' :
                    riskLevel === 'med' ? 'border-amber-200' : 'border-slate-200'
        )}>
            {/* Card Header — clickable to expand */}
            <button
                type="button"
                className={cn(
                    'w-full px-4 py-4 flex items-center justify-between text-left transition-colors',
                    colors.bg,
                    'hover:brightness-95'
                )}
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{dept}</span>
                        {hasOverdue && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
                        {riskLevel === 'high' && <Badge className="text-[10px] h-4 px-1.5 bg-red-100 text-red-700 border-red-200 font-bold">High Risk</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {inProgress.length} active · {waiting.length} waiting · avg {avgWait}m
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={cn(
                        'text-2xl font-extrabold',
                        riskLevel === 'high' ? 'text-red-600' : riskLevel === 'med' ? 'text-amber-600' : 'text-emerald-600'
                    )}>
                        {patients.length}
                    </span>
                    {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
            </button>

            {/* Expanded Patient List */}
            {expanded && (
                <div className="border-t border-slate-200 bg-white p-3 space-y-2">
                    {patients.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-3 font-medium">No patients in this zone</p>
                    )}
                    {patients.map(p => (
                        <PatientMiniCard
                            key={p.id}
                            patient={p}
                            onSelect={() => onSelectPatient(p)}
                            onReroute={(skip) => onReroute(p.id, skip)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FloorManagerDashboard() {
    const { patients, reroutePatient, selectPatient } = useStore();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const departments: Department[] = ['Registration', 'Refraction', 'Dilation', 'Consultation', 'Tests'];

    const getDeptPatients = (dept: Department) =>
        patients.filter(p => p.currentDepartment === dept && p.status !== 'COMPLETED');

    const totalActive = patients.filter(p => p.status !== 'COMPLETED').length;
    const overdueCount = patients.filter(p => formatMinutes(p.enteredZoneAt) > 30 && p.status !== 'COMPLETED').length;

    const handleSelectPatient = (patient: Patient) => {
        selectPatient(patient.id);
        setSelectedPatient(patient);
    };

    const handleReroute = (patientId: string, skipDept: Department) => {
        reroutePatient(patientId, skipDept);
        // Update selectedPatient if it's the one being rerouted
        if (selectedPatient?.id === patientId) {
            const updated = patients.find(p => p.id === patientId);
            if (updated) setSelectedPatient({ ...updated });
        }
    };

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'FLOOR_LEAD']}>
            <div className="flex gap-6 h-[calc(100vh-80px)]">
                {/* ─── Main Content ─── */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-w-0">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Floor Control · Sector B</h2>
                            <p className="text-slate-500 mt-1 text-sm">Live patient tracking, zone management & intelligent rerouting.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {overdueCount > 0 && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse">
                                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                    {overdueCount} Overdue
                                </Badge>
                            )}
                            <Button variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
                                <Settings2 className="w-4 h-4 mr-2" /> Layout
                            </Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                                <ArrowRightLeft className="w-4 h-4 mr-2" /> AI Balancer
                            </Button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Active Patients', value: totalActive, color: 'text-slate-900' },
                            { label: 'Overdue (>30m)', value: overdueCount, color: overdueCount > 0 ? 'text-amber-600' : 'text-slate-900' },
                            { label: 'Completed Today', value: patients.filter(p => p.status === 'COMPLETED').length, color: 'text-emerald-600' },
                        ].map(s => (
                            <Card key={s.label} className="bg-white border-slate-200 rounded-xl shadow-sm">
                                <CardContent className="p-5">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                                    <p className={cn('text-3xl font-extrabold mt-1', s.color)}>{s.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Interactive Zone Cards */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Zone Control</h3>
                            <p className="text-xs text-slate-400 font-medium">Click any zone to expand patient list</p>
                        </div>
                        {departments.map(dept => (
                            <ZoneControlCard
                                key={dept}
                                dept={dept}
                                patients={getDeptPatients(dept)}
                                onSelectPatient={handleSelectPatient}
                                onReroute={handleReroute}
                            />
                        ))}
                    </div>

                    {/* AI Rerouting Suggestion */}
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-teal-900 font-semibold flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                                AI Active Rerouting
                            </CardTitle>
                            <CardDescription>Live routing adjustments based on latency and queue depth.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
                                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
                                    <ArrowRightLeft className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-emerald-900">Action Suggested</h4>
                                    <p className="text-sm text-emerald-800/80 mt-1">Refraction A is overloaded (+35m avg wait). Diverting next 10 patients to Refraction C.</p>
                                    <div className="mt-3 flex gap-2">
                                        <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold">Auto Approve</Button>
                                        <Button size="sm" variant="outline" className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold">Manual Override</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Patient Sidebar ─── */}
                {selectedPatient ? (
                    <div className="w-96 shrink-0 h-full">
                        <MasterPatientSidebar
                            patient={selectedPatient}
                            onClose={() => { setSelectedPatient(null); selectPatient(null); }}
                        />
                    </div>
                ) : (
                    <div className="w-80 shrink-0 h-full border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <User className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No patient selected</p>
                        <p className="text-xs text-slate-400 mt-1">Click "View" on any patient to see their Master Record</p>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
