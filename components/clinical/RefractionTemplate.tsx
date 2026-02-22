'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore, Patient, RefractionData } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Save, ChevronRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Schema ────────────────────────────────────────────────────────────────────
const RefractionSchema = z.object({
    vaRight: z.string().min(1, 'Required'),
    vaLeft: z.string().min(1, 'Required'),
    sphereRight: z.string().min(1, 'Required'),
    sphereLeft: z.string().min(1, 'Required'),
    cylinderRight: z.string().min(1, 'Required'),
    cylinderLeft: z.string().min(1, 'Required'),
    axisRight: z.string().min(1, 'Required'),
    axisLeft: z.string().min(1, 'Required'),
    iopRight: z.string().min(1, 'Required'),
    iopLeft: z.string().min(1, 'Required'),
    notes: z.string(),
});

type RefractionForm = z.infer<typeof RefractionSchema>;

// ─── Options ───────────────────────────────────────────────────────────────────
const VA_OPTIONS = ['6/4', '6/5', '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM', 'PL', 'NPL'];
const SPHERE_OPTIONS = ['0.00', '+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.50', '+3.00',
    '-0.25', '-0.50', '-0.75', '-1.00', '-1.25', '-1.50', '-2.00', '-2.50', '-3.00', '-3.50', '-4.00', '-5.00', '-6.00'];
const CYL_OPTIONS = ['0.00', '-0.25', '-0.50', '-0.75', '-1.00', '-1.25', '-1.50', '-2.00', '-2.50', '-3.00'];
const AXIS_OPTIONS = Array.from({ length: 18 }, (_, i) => String((i + 1) * 10));
const IOP_OPTIONS = Array.from({ length: 25 }, (_, i) => String(i + 8)); // 8–32

// ─── Quick-Select Dropdown ─────────────────────────────────────────────────────
function QuickSelect({
    label, options, value, onChange, highlight
}: {
    label: string; options: string[]; value: string;
    onChange: (v: string) => void; highlight?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={cn(
                        'w-full h-11 px-3 pr-8 rounded-xl border text-sm font-semibold text-slate-900 bg-white',
                        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
                        'appearance-none cursor-pointer transition-all',
                        highlight ? 'border-emerald-400 ring-1 ring-emerald-300 bg-emerald-50' : 'border-slate-200'
                    )}
                >
                    <option value="">Select</option>
                    {options.map(o => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

// ─── Quick-Chip buttons for common VA values ───────────────────────────────────
function VAChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const common = ['6/6', '6/9', '6/12', '6/18', '6/60', 'CF'];
    return (
        <div className="flex flex-wrap gap-1.5 mt-1">
            {common.map(v => (
                <button
                    key={v} type="button"
                    onClick={() => onChange(v)}
                    className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all',
                        value === v
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                    )}
                >
                    {v}
                </button>
            ))}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface RefractionTemplateProps {
    patient: Patient;
    onSaveAndMove?: () => void;
}

export function RefractionTemplate({ patient, onSaveAndMove }: RefractionTemplateProps) {
    const { saveRefractionData, saveDraft, movePatientToNextZone } = useStore();
    const [saved, setSaved] = useState(false);

    const existing = patient.refractionData || patient.draft?.refraction;

    const { control, handleSubmit, watch, formState: { errors } } = useForm<RefractionForm>({
        resolver: zodResolver(RefractionSchema),
        defaultValues: {
            vaRight: existing?.vaRight || '',
            vaLeft: existing?.vaLeft || '',
            sphereRight: existing?.sphereRight || '',
            sphereLeft: existing?.sphereLeft || '',
            cylinderRight: existing?.cylinderRight || '',
            cylinderLeft: existing?.cylinderLeft || '',
            axisRight: existing?.axisRight || '',
            axisLeft: existing?.axisLeft || '',
            iopRight: existing?.iopRight || '',
            iopLeft: existing?.iopLeft || '',
            notes: existing?.notes || '',
        },
    });

    const values = watch();

    // Auto-save draft on change
    const handleFormChange = () => {
        saveDraft(patient.id, 'refraction', values);
    };

    const onSubmit = (data: RefractionForm) => {
        saveRefractionData(patient.id, {
            ...data,
            notes: data.notes ?? '',
            savedAt: new Date().toISOString(),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleSaveAndMove = handleSubmit((data) => {
        saveRefractionData(patient.id, { ...data, notes: data.notes ?? '', savedAt: new Date().toISOString() });
        movePatientToNextZone(patient.id);
        onSaveAndMove?.();
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} onChange={handleFormChange} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Refraction Template</h3>
                        <p className="text-xs text-slate-500 font-medium">Fast-fill mode · All dropdowns</p>
                    </div>
                </div>
                <Badge className="bg-sky-100 text-sky-700 border-sky-200 font-semibold">
                    {patient.token} · {patient.name}
                </Badge>
            </div>

            {/* Grid: Right Eye / Left Eye */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Right Eye (OD) */}
                <Card className="bg-slate-50 border-slate-200 rounded-xl shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-5">
                        <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center border border-blue-200">R</span>
                            Right Eye (OD)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-4">
                        <div>
                            <Controller name="vaRight" control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Visual Acuity</label>
                                        <VAChips value={field.value} onChange={field.onChange} />
                                        <QuickSelect label="" options={VA_OPTIONS} value={field.value} onChange={field.onChange} highlight />
                                    </div>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <Controller name="sphereRight" control={control}
                                render={({ field }) => (
                                    <QuickSelect label="Sphere" options={SPHERE_OPTIONS} value={field.value} onChange={field.onChange} />
                                )}
                            />
                            <Controller name="cylinderRight" control={control}
                                render={({ field }) => (
                                    <QuickSelect label="Cylinder" options={CYL_OPTIONS} value={field.value} onChange={field.onChange} />
                                )}
                            />
                            <Controller name="axisRight" control={control}
                                render={({ field }) => (
                                    <QuickSelect label="Axis °" options={AXIS_OPTIONS} value={field.value} onChange={field.onChange} />
                                )}
                            />
                        </div>
                        <Controller name="iopRight" control={control}
                            render={({ field }) => (
                                <QuickSelect label="IOP (mmHg)" options={IOP_OPTIONS} value={field.value} onChange={field.onChange} />
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Left Eye (OS) */}
                <Card className="bg-slate-50 border-slate-200 rounded-xl shadow-sm">
                    <CardHeader className="pb-3 pt-4 px-5">
                        <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold flex items-center justify-center border border-emerald-200">L</span>
                            Left Eye (OS)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 space-y-4">
                        <div>
                            <Controller name="vaLeft" control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Visual Acuity</label>
                                        <VAChips value={field.value} onChange={field.onChange} />
                                        <QuickSelect label="" options={VA_OPTIONS} value={field.value} onChange={field.onChange} highlight />
                                    </div>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <Controller name="sphereLeft" control={control}
                                render={({ field }) => (
                                    <QuickSelect label="Sphere" options={SPHERE_OPTIONS} value={field.value} onChange={field.onChange} />
                                )}
                            />
                            <Controller name="cylinderLeft" control={control}
                                render={({ field }) => (
                                    <QuickSelect label="Cylinder" options={CYL_OPTIONS} value={field.value} onChange={field.onChange} />
                                )}
                            />
                            <Controller name="axisLeft" control={control}
                                render={({ field }) => (
                                    <QuickSelect label="Axis °" options={AXIS_OPTIONS} value={field.value} onChange={field.onChange} />
                                )}
                            />
                        </div>
                        <Controller name="iopLeft" control={control}
                            render={({ field }) => (
                                <QuickSelect label="IOP (mmHg)" options={IOP_OPTIONS} value={field.value} onChange={field.onChange} />
                            )}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Additional Notes</label>
                <Controller name="notes" control={control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="Any additional observations..."
                            className="bg-white border-slate-200 resize-none h-20 text-slate-900 text-sm focus-visible:ring-emerald-500"
                        />
                    )}
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button type="submit" variant="outline"
                    className={cn('border-slate-300 text-slate-700 bg-white transition-all',
                        saved && 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    )}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saved ? 'Saved ✓' : 'Save Draft'}
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveAndMove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 h-12 px-8 font-bold text-base"
                >
                    Save & Move to Dilation
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </form>
    );
}
