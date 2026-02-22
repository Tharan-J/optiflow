'use client';

import { useStore, Patient } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Activity, Stethoscope, Clock, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MasterPatientSidebar } from '@/components/clinical/MasterPatientSidebar';
import { ConsultationTemplate } from '@/components/clinical/ConsultationTemplate';

export default function DoctorDashboard() {
    const { patients, updatePatientStatus, selectPatient: selectInStore } = useStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [completedIds, setCompletedIds] = useState<string[]>([]);

    const queue = patients.filter(p => p.currentDepartment === 'Consultation' && p.status !== 'COMPLETED');
    const activePatient = patients.find(p => p.id === selectedId) || queue[0] || null;

    const handleSelect = (p: Patient) => {
        setSelectedId(p.id);
        selectInStore(p.id);
        updatePatientStatus(p.id, 'Consultation', 'IN_PROGRESS');
    };

    const handleComplete = () => {
        if (!activePatient) return;
        updatePatientStatus(activePatient.id, 'Consultation', 'COMPLETED');
        setCompletedIds(prev => [...prev, activePatient.id]);
        // Move to next in queue
        const next = queue.find(p => p.id !== activePatient.id);
        setSelectedId(next?.id || null);
    };

    const formatMinutes = (iso?: string) =>
        !iso ? 0 : Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'DOCTOR']}>
            <div className="grid gap-0 md:grid-cols-[350px_1fr_320px] h-[calc(100vh-90px)]">
                {/* ─── Patient Queue ─── */}
                <div className="flex flex-col gap-3 overflow-hidden h-full pr-4 border-r border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Today's Queue</h2>
                            <p className="text-xs text-slate-500 mt-0.5">{queue.length} patients remaining</p>
                        </div>
                        <Badge className="bg-emerald-600 text-white border-0 shadow-sm font-semibold">
                            Dr. Smith
                        </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pb-4">
                        {queue.map((p) => {
                            const mins = formatMinutes(p.enteredZoneAt);
                            const isOverdue = mins > 30;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => handleSelect(p)}
                                    className={cn(
                                        'p-4 rounded-xl border cursor-pointer transition-all duration-200',
                                        activePatient?.id === p.id
                                            ? 'bg-sky-50 border-sky-300 shadow-sm ring-1 ring-sky-200'
                                            : isOverdue
                                                ? 'bg-amber-50 border-amber-200 hover:border-amber-300 animate-pulse'
                                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm text-slate-900">{p.name}</span>
                                        <Badge variant="outline" className={cn(
                                            'text-[10px] px-2 py-0 h-5 bg-white font-bold uppercase tracking-widest',
                                            p.complexityScore >= 8 ? 'text-red-700 border-red-300 bg-red-50' :
                                                p.complexityScore >= 5 ? 'text-amber-700 border-amber-300 bg-amber-50' :
                                                    'text-emerald-700 border-emerald-300 bg-emerald-50'
                                        )}>
                                            CMPLX {p.complexityScore}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{p.token}</span>
                                        <div className={cn('flex items-center gap-1', isOverdue && 'text-amber-700 font-semibold')}>
                                            <Clock className="w-3 h-3" />
                                            {mins}m {isOverdue && '⚠'}
                                        </div>
                                    </div>
                                    {/* Allergies preview in queue */}
                                    {p.allergies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {p.allergies.map(a => (
                                                <span key={a} className="text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded">
                                                    ⚠ {a}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {queue.length === 0 && (
                            <div className="text-center py-16 text-slate-400">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                                <p className="font-bold text-sm">Queue Empty!</p>
                                <p className="text-xs mt-1">All patients have been seen.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Consultation Workspace ─── */}
                <div className="flex flex-col h-full overflow-y-auto px-6">
                    {activePatient ? (
                        <>
                            {/* Patient Header Bar */}
                            <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 pb-4 mb-6 pt-1">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                                            <Stethoscope className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{activePatient.name}</h3>
                                            <p className="text-xs text-slate-500">
                                                {activePatient.age}y · {activePatient.gender} · {activePatient.token} · {activePatient.symptoms.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleComplete}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 font-bold px-6"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Mark Complete
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs: Consultation | History */}
                            <Tabs defaultValue="consultation" className="flex-1">
                                <TabsList className="bg-white border border-slate-200 rounded-xl shadow-sm p-1 mb-6 w-full">
                                    <TabsTrigger value="consultation" className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                        <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Consultation
                                    </TabsTrigger>
                                    <TabsTrigger value="history" className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                        <FileText className="w-3.5 h-3.5 mr-1.5" /> Visit History
                                    </TabsTrigger>
                                    <TabsTrigger value="vitals" className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                        <Activity className="w-3.5 h-3.5 mr-1.5" /> Findings
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="consultation">
                                    <ConsultationTemplate
                                        patient={activePatient}
                                        onSaveAndMove={() => {
                                            setCompletedIds(prev => [...prev, activePatient.id]);
                                            const next = queue.find(p => p.id !== activePatient.id);
                                            setSelectedId(next?.id || null);
                                        }}
                                    />
                                </TabsContent>

                                <TabsContent value="history">
                                    <div className="space-y-4">
                                        <div className="bg-white border border-slate-200 rounded-xl p-5">
                                            <h4 className="font-bold text-sm text-slate-900 mb-3">Medical History</h4>
                                            {activePatient.history.length > 0 ? (
                                                <div className="space-y-2">
                                                    {activePatient.history.map(h => (
                                                        <div key={h} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                            {h}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400">No medical history recorded.</p>
                                            )}
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-xl p-5">
                                            <h4 className="font-bold text-sm text-slate-900 mb-3">Today's Journey</h4>
                                            <div className="space-y-2">
                                                {activePatient.timeline.filter(t => t.status === 'done').map(t => (
                                                    <div key={t.department} className="flex items-center justify-between text-sm text-slate-700">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                            <span className="font-medium">{t.department}</span>
                                                        </div>
                                                        {t.summary && <span className="text-xs text-slate-400 font-medium">{t.summary}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="vitals">
                                    <div className="space-y-4">
                                        {activePatient.refractionData ? (
                                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-5">
                                                <h4 className="font-bold text-sm text-sky-800 mb-4">Refraction Findings</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {[
                                                        ['VA OD', activePatient.refractionData.vaRight],
                                                        ['VA OS', activePatient.refractionData.vaLeft],
                                                        ['IOP OD', `${activePatient.refractionData.iopRight} mmHg`],
                                                        ['IOP OS', `${activePatient.refractionData.iopLeft} mmHg`],
                                                        ['SPH OD', activePatient.refractionData.sphereRight],
                                                        ['SPH OS', activePatient.refractionData.sphereLeft],
                                                        ['CYL OD', activePatient.refractionData.cylinderRight],
                                                        ['CYL OS', activePatient.refractionData.cylinderLeft],
                                                        ['Axis OD', `${activePatient.refractionData.axisRight}°`],
                                                        ['Axis OS', `${activePatient.refractionData.axisLeft}°`],
                                                    ].map(([label, val]) => (
                                                        <div key={label}>
                                                            <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{label}</p>
                                                            <p className="text-sm font-bold text-slate-900">{val}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {activePatient.refractionData.notes && (
                                                    <p className="text-xs text-slate-600 bg-white border border-sky-100 rounded-lg p-3 font-medium mt-4">
                                                        📝 {activePatient.refractionData.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 text-center py-8">No refraction data available yet.</p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <Stethoscope className="w-10 h-10 text-emerald-300" />
                                </div>
                                <h3 className="font-bold text-slate-900">No Patient Selected</h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-xs">Select a patient from the queue to begin consultation.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Master Patient Sidebar ─── */}
                <div className="h-full border-l border-slate-200">
                    {activePatient ? (
                        <MasterPatientSidebar patient={activePatient} />
                    ) : (
                        <div className="flex-1 h-full flex items-center justify-center text-center p-8">
                            <p className="text-xs text-slate-400 font-medium">Patient record will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
