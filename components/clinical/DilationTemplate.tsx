'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore, Patient } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Droplets, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Schema ────────────────────────────────────────────────────────────────────
const DilationSchema = z.object({
    drugUsed: z.enum(['Tropicamide', 'Phenylephrine', 'Tropicamide+Phenylephrine']),
    eyeTreated: z.enum(['OD', 'OS', 'OU']),
    dropTime: z.string().min(1, 'Required'),
    notes: z.string(),
});

type DilationForm = z.infer<typeof DilationSchema>;

const DRUG_OPTIONS = [
    { value: 'Tropicamide', label: 'Tropicamide 1%', color: 'bg-violet-100 border-violet-300 text-violet-800' },
    { value: 'Phenylephrine', label: 'Phenylephrine 2.5%', color: 'bg-amber-100 border-amber-300 text-amber-800' },
    { value: 'Tropicamide+Phenylephrine', label: 'Tropicamide + Phenylephrine', color: 'bg-rose-100 border-rose-300 text-rose-800' },
];

const EYE_OPTIONS = [
    { value: 'OD', label: 'Right Eye (OD)' },
    { value: 'OS', label: 'Left Eye (OS)' },
    { value: 'OU', label: 'Both Eyes (OU)' },
];

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function computeReadyTime(dropTimeISO: string): string {
    const d = new Date(dropTimeISO);
    d.setMinutes(d.getMinutes() + 20);
    return d.toISOString();
}

interface DilationTemplateProps {
    patient: Patient;
    onSaveAndMove?: () => void;
}

export function DilationTemplate({ patient, onSaveAndMove }: DilationTemplateProps) {
    const { saveDilationData, saveDraft, movePatientToNextZone } = useStore();
    const existing = patient.dilationData || patient.draft?.dilation;

    const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitSuccessful } } = useForm<DilationForm>({
        resolver: zodResolver(DilationSchema),
        defaultValues: {
            drugUsed: (existing?.drugUsed as DilationForm['drugUsed']) || 'Tropicamide',
            eyeTreated: (existing?.eyeTreated as DilationForm['eyeTreated']) || 'OU',
            dropTime: existing?.dropTime || new Date().toISOString(),
            notes: existing?.notes || '',
        },
    });

    const watchedValues = watch();
    const dropTime = watchedValues.dropTime;
    const readyTime = dropTime ? computeReadyTime(dropTime) : '';
    const isReady = readyTime ? new Date(readyTime) <= new Date() : false;
    const minutesLeft = readyTime
        ? Math.max(0, Math.floor((new Date(readyTime).getTime() - Date.now()) / 60000))
        : 20;

    // Auto-save draft
    useEffect(() => {
        saveDraft(patient.id, 'dilation', watchedValues);
    }, [JSON.stringify(watchedValues)]);

    const onSubmit = (data: DilationForm) => {
        saveDilationData(patient.id, {
            ...data,
            notes: data.notes ?? '',
            readyTime: computeReadyTime(data.dropTime),
            savedAt: new Date().toISOString(),
        });
    };

    const handleSaveAndMove = handleSubmit((data) => {
        saveDilationData(patient.id, {
            ...data,
            notes: data.notes ?? '',
            readyTime: computeReadyTime(data.dropTime),
            savedAt: new Date().toISOString(),
        });
        movePatientToNextZone(patient.id);
        onSaveAndMove?.();
    });

    const setDropNow = () => {
        setValue('dropTime', new Date().toISOString());
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Dilation Template</h3>
                        <p className="text-xs text-slate-500 font-medium">Time-stamped triggers · Auto ready timer</p>
                    </div>
                </div>
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 font-semibold">
                    {patient.token} · {patient.name}
                </Badge>
            </div>

            {/* Readiness Timer Banner */}
            <div className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all',
                isReady
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : minutesLeft <= 5
                        ? 'border-amber-400 bg-amber-50 text-amber-800 animate-pulse'
                        : 'border-violet-200 bg-violet-50 text-violet-800'
            )}>
                {isReady ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-current shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                )}
                <div>
                    <p className="font-bold text-base">
                        {isReady ? '✓ Patient Ready for Examination' : `Ready in ${minutesLeft} minutes`}
                    </p>
                    {!isReady && readyTime && (
                        <p className="text-sm font-medium opacity-80">
                            Drop given at {formatTime(dropTime)} → Ready by {formatTime(readyTime)}
                        </p>
                    )}
                    {isReady && (
                        <p className="text-sm font-medium opacity-80">Drop administered at {formatTime(dropTime)}</p>
                    )}
                </div>
            </div>

            {/* Drug Selection */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Drug Used</label>
                <Controller name="drugUsed" control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
                            {DRUG_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => field.onChange(opt.value)}
                                    className={cn(
                                        'p-4 rounded-xl border-2 text-left transition-all',
                                        field.value === opt.value
                                            ? `${opt.color} ring-2 ring-offset-1 ring-current font-bold shadow-sm`
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                                    )}
                                >
                                    <Droplets className="w-4 h-4 mb-2" />
                                    <span className="text-xs font-bold block">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Eye Treated */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Eye Treated</label>
                <Controller name="eyeTreated" control={control}
                    render={({ field }) => (
                        <div className="flex gap-3">
                            {EYE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => field.onChange(opt.value)}
                                    className={cn(
                                        'flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all',
                                        field.value === opt.value
                                            ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Drop Time */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Time of Drop</label>
                    <button
                        type="button"
                        onClick={setDropNow}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                    >
                        Set to Now ({new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })})
                    </button>
                </div>
                <Controller name="dropTime" control={control}
                    render={({ field }) => (
                        <div className="flex gap-3 items-center">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                                <Clock className="w-5 h-5 text-violet-500" />
                                <span className="font-bold text-slate-900 text-sm">
                                    {field.value ? formatTime(field.value) : 'Not set'}
                                </span>
                            </div>
                            <div className="text-slate-300 font-bold">→</div>
                            <div className={cn(
                                'flex-1 flex items-center gap-3 px-4 py-3 border-2 rounded-xl font-bold text-sm',
                                isReady ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-violet-50 border-violet-200 text-violet-800'
                            )}>
                                <CheckCircle2 className={cn('w-5 h-5', isReady ? 'text-emerald-500' : 'text-violet-400')} />
                                Ready: {readyTime ? formatTime(readyTime) : '+20 min'}
                            </div>
                        </div>
                    )}
                />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Notes</label>
                <Controller name="notes" control={control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="Any observations about the dilation..."
                            className="bg-white border-slate-200 resize-none h-20 text-slate-900 text-sm focus-visible:ring-emerald-500"
                        />
                    )}
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button type="submit" variant="outline" className="border-slate-300 text-slate-700 bg-white">
                    Save Record
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveAndMove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 h-12 px-8 font-bold text-base"
                >
                    Save & Move to Consultation
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </form>
    );
}
