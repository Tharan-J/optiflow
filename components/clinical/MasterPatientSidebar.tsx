'use client';

import { Patient, Department } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    User, Activity, AlertTriangle, Clock, ChevronRight,
    CheckCircle2, Circle, ArrowRight, X, Pill, Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MasterPatientSidebarProps {
    patient: Patient;
    onClose?: () => void;
    isModal?: boolean;
}

const DEPT_COLORS: Record<string, string> = {
    Registration: 'bg-slate-100 text-slate-700 border-slate-300',
    Refraction: 'bg-sky-100 text-sky-800 border-sky-300',
    Dilation: 'bg-violet-100 text-violet-800 border-violet-300',
    Consultation: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Tests: 'bg-amber-100 text-amber-800 border-amber-300',
    Counseling: 'bg-orange-100 text-orange-800 border-orange-300',
    Pharmacy: 'bg-teal-100 text-teal-800 border-teal-300',
};

function ComplexityBadge({ score }: { score: number }) {
    const config =
        score >= 8
            ? { label: 'High Risk', cls: 'bg-red-100 text-red-800 border-red-300' }
            : score >= 5
                ? { label: 'Standard', cls: 'bg-amber-100 text-amber-800 border-amber-300' }
                : { label: 'Routine', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    return (
        <Badge className={cn('font-bold border text-xs px-2 py-0.5', config.cls)}>
            {config.label} · {score}/10
        </Badge>
    );
}

function StatusDot({ status }: { status: 'done' | 'current' | 'next' | 'skipped' }) {
    if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (status === 'current') return (
        <div className="w-5 h-5 rounded-full bg-sky-500 shrink-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        </div>
    );
    if (status === 'skipped') return <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 shrink-0" />;
    return <Circle className="w-5 h-5 text-slate-300 shrink-0" />;
}

function formatTime(iso?: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function MasterPatientSidebar({ patient, onClose, isModal = false }: MasterPatientSidebarProps) {
    const minutesInZone = patient.enteredZoneAt
        ? Math.floor((Date.now() - new Date(patient.enteredZoneAt).getTime()) / 60000)
        : 0;

    const isOverdue = minutesInZone > 30;

    return (
        <div className={cn(
            'flex flex-col bg-white border-l border-slate-200 shadow-xl h-full',
            isModal ? 'rounded-2xl border shadow-2xl' : 'w-full'
        )}>
            {/* ── Header ── */}
            <div className={cn(
                'p-5 border-b border-slate-100 relative',
                isOverdue ? 'bg-amber-50' : 'bg-white'
            )}>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <div className="flex items-start gap-4 pr-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
                        <User className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{patient.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 font-medium">{patient.age}y · {patient.gender}</span>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{patient.token}</span>
                            <ComplexityBadge score={patient.complexityScore} />
                        </div>
                    </div>
                </div>

                {/* Time in Zone Alert */}
                <div className={cn(
                    'mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border',
                    isOverdue
                        ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                )}>
                    <Clock className="w-4 h-4 shrink-0" />
                    In <span className="font-bold mx-1">{patient.currentDepartment}</span> for
                    <span className={cn('ml-1 font-bold', isOverdue && 'text-amber-700')}>{minutesInZone} min</span>
                    {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 ml-1" />}
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-5 space-y-6">

                    {/* ── Journey Timeline ── */}
                    <section>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Patient Journey
                        </h4>
                        <div className="space-y-0">
                            {patient.timeline.map((entry, idx) => (
                                <div key={entry.department} className="flex gap-3 items-start">
                                    {/* Line */}
                                    <div className="flex flex-col items-center">
                                        <StatusDot status={entry.status} />
                                        {idx < patient.timeline.length - 1 && (
                                            <div className={cn(
                                                'w-0.5 h-8 mt-1',
                                                entry.status === 'done' ? 'bg-emerald-200' :
                                                    entry.status === 'current' ? 'bg-sky-200' : 'bg-slate-100'
                                            )} />
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                'text-sm font-semibold',
                                                entry.status === 'done' ? 'text-slate-700' :
                                                    entry.status === 'current' ? 'text-sky-800' :
                                                        entry.status === 'skipped' ? 'text-slate-400 line-through' :
                                                            'text-slate-400'
                                            )}>
                                                {entry.department}
                                            </span>
                                            {entry.completedAt && (
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    {formatTime(entry.completedAt)}
                                                </span>
                                            )}
                                        </div>
                                        {entry.status === 'current' && (
                                            <span className="text-[11px] text-sky-600 font-semibold mt-0.5 block">
                                                ● Active · since {formatTime(entry.enteredAt)}
                                            </span>
                                        )}
                                        {entry.summary && (
                                            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                                                {entry.summary}
                                            </span>
                                        )}
                                        {entry.status === 'skipped' && (
                                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                                                Skipped by Floor Manager
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* ── Allergies ── */}
                    {patient.allergies.length > 0 && (
                        <section>
                            <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> Allergies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {patient.allergies.map(a => (
                                    <Badge key={a} className="bg-red-100 text-red-800 border border-red-300 font-bold text-xs">
                                        {a}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Medical History ── */}
                    {patient.history.length > 0 && (
                        <section>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Medical History
                            </h4>
                            <div className="space-y-1">
                                {patient.history.map(h => (
                                    <div key={h} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                        {h}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <Separator />

                    {/* ── Refraction Data ── */}
                    {patient.refractionData && (
                        <section>
                            <h4 className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Refraction Findings
                            </h4>
                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'VA Right (OD)', val: patient.refractionData.vaRight },
                                        { label: 'VA Left (OS)', val: patient.refractionData.vaLeft },
                                        { label: 'IOP Right', val: `${patient.refractionData.iopRight} mmHg` },
                                        { label: 'IOP Left', val: `${patient.refractionData.iopLeft} mmHg` },
                                        { label: 'SPH Right', val: patient.refractionData.sphereRight },
                                        { label: 'SPH Left', val: patient.refractionData.sphereLeft },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{item.label}</p>
                                            <p className="text-sm font-bold text-slate-900">{item.val}</p>
                                        </div>
                                    ))}
                                </div>
                                {patient.refractionData.notes && (
                                    <p className="text-xs text-slate-600 bg-white border border-sky-100 rounded-lg p-2 font-medium">
                                        📝 {patient.refractionData.notes}
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── Dilation Data ── */}
                    {patient.dilationData && (
                        <section>
                            <h4 className="text-xs font-bold text-violet-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Pill className="w-3.5 h-3.5" /> Dilation Record
                            </h4>
                            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Drug</p>
                                        <p className="text-sm font-bold text-slate-900">{patient.dilationData.drugUsed}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Eye</p>
                                        <p className="text-sm font-bold text-slate-900">{patient.dilationData.eyeTreated}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Drop Time</p>
                                        <p className="text-sm font-bold text-slate-900">{formatTime(patient.dilationData.dropTime)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Ready By</p>
                                        <p className={cn('text-sm font-bold', new Date(patient.dilationData.readyTime) <= new Date() ? 'text-emerald-700' : 'text-amber-700')}>
                                            {formatTime(patient.dilationData.readyTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── Consultation Data ── */}
                    {patient.consultationData && (
                        <section>
                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Stethoscope className="w-3.5 h-3.5" /> Consultation
                            </h4>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Diagnosis</p>
                                    <p className="text-sm font-bold text-slate-900">{patient.consultationData.diagnosis}</p>
                                </div>
                                {patient.consultationData.prescription.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Prescription</p>
                                        <div className="space-y-1">
                                            {patient.consultationData.prescription.map(rx => (
                                                <div key={rx.id} className="text-xs text-slate-700 font-medium bg-white border border-emerald-100 rounded-lg px-3 py-2">
                                                    <span className="font-bold text-slate-900">{rx.medicine}</span>
                                                    {' '}{rx.dosage} {rx.unit} · {rx.frequency.join('/')} · {rx.duration}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── Symptoms ── */}
                    <section>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Symptoms</h4>
                        <div className="flex flex-wrap gap-2">
                            {patient.symptoms.map(s => (
                                <Badge key={s} variant="outline" className="border-slate-200 text-slate-700 bg-slate-50 text-xs">
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* Phone */}
                    <p className="text-xs text-slate-400 font-medium">📞 {patient.phone}</p>
                </div>
            </ScrollArea>
        </div>
    );
}
