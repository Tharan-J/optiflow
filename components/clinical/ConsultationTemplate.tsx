'use client';

import { useState, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore, Patient, PrescriptionItem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Stethoscope, Plus, Minus, X, ChevronRight, Search,
    Pencil, Eraser, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Schema ────────────────────────────────────────────────────────────────────
const RxItemSchema = z.object({
    id: z.string(),
    medicine: z.string().min(1),
    dosage: z.number().min(0.5),
    unit: z.enum(['tab', 'drop', 'mg']),
    frequency: z.array(z.string()).min(1, 'Select at least one'),
    duration: z.string().min(1),
    route: z.enum(['oral', 'topical', 'injection']),
});

const ConsultationSchema = z.object({
    hpi: z.string().min(5, 'Please describe the history of presenting illness'),
    diagnosis: z.string().min(1, 'Required'),
    diagnosisCode: z.string(),
    eyeFindings: z.string(),
    prescription: z.array(RxItemSchema),
    followUpDays: z.number().min(0).max(365),
    referral: z.string(),
    notes: z.string(),
});

type ConsultationFormType = z.infer<typeof ConsultationSchema>;

// ─── Constants ─────────────────────────────────────────────────────────────────
const DIAGNOSIS_OPTIONS = [
    'Myopia', 'Hyperopia', 'Astigmatism', 'Presbyopia',
    'Cataract - Immature', 'Cataract - Mature', 'Glaucoma - POAG',
    'Diabetic Retinopathy - NPDR', 'Diabetic Retinopathy - PDR',
    'Retinal Detachment', 'Macular Degeneration - Dry', 'Macular Degeneration - Wet',
    'Dry Eye Syndrome', 'Allergic Conjunctivitis', 'Bacterial Conjunctivitis',
    'Computer Vision Syndrome', 'Amblyopia', 'Strabismus',
];

const MEDICINES = [
    'Moxifloxacin 0.5%', 'Ofloxacin 0.3%', 'Timolol 0.5%', 'Latanoprost 0.005%',
    'Dorzolamide 2%', 'Brimonidine 0.15%', 'Prednisolone Acetate 1%',
    'Ketorolac 0.5%', 'Sodium Hyaluronate 0.1%', 'Carboxymethylcellulose 0.5%',
    'Tobramycin + Dexamethasone', 'Ciprofloxacin 0.3%', 'Cyclopentolate 1%',
    'Pilocarpine 2%', 'Acetazolamide 250mg', 'Vitamin A Palmitate',
    'Omega-3 Supplement', 'Lubricating Eye Gel',
];

const FREQUENCIES = ['Morning', 'Afternoon', 'Evening', 'Night'];

const FOLLOW_UP_OPTIONS = [7, 14, 21, 30, 45, 60, 90];

// ─── Eye Diagram Canvas ────────────────────────────────────────────────────────
function EyeDiagramCanvas({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const canvasRef = useRef<SVGSVGElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [paths, setPaths] = useState<{ d: string; color: string; width: number }[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');
    const markColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];
    const [activeColor, setActiveColor] = useState(markColors[0]);

    const getPoint = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        const p = getPoint(e);
        setIsDrawing(true);
        setCurrentPath(`M ${p.x} ${p.y}`);
    };

    const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isDrawing) return;
        const p = getPoint(e);
        setCurrentPath(prev => `${prev} L ${p.x} ${p.y}`);
    };

    const onMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentPath) {
            const newPaths = [...paths, { d: currentPath, color: tool === 'eraser' ? 'white' : activeColor, width: tool === 'eraser' ? 16 : 3 }];
            setPaths(newPaths);
            onChange(JSON.stringify(newPaths));
        }
        setCurrentPath('');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                    <button type="button" onClick={() => setTool('pen')}
                        className={cn('p-2 rounded-md transition-all', tool === 'pen' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700')}>
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setTool('eraser')}
                        className={cn('p-2 rounded-md transition-all', tool === 'eraser' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700')}>
                        <Eraser className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2 ml-2">
                    {markColors.map(c => (
                        <button key={c} type="button" onClick={() => { setActiveColor(c); setTool('pen'); }}
                            className={cn('w-6 h-6 rounded-full border-2 transition-all', activeColor === c ? 'border-slate-900 scale-110' : 'border-transparent')}
                            style={{ backgroundColor: c }} />
                    ))}
                </div>
                <button type="button" onClick={() => { setPaths([]); onChange(''); }}
                    className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Clear
                </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border-2 border-slate-200">
                {/* SVG Eye Diagram  */}
                <svg
                    ref={canvasRef}
                    width="100%" height="220"
                    className="cursor-crosshair bg-white"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={() => setIsDrawing(false)}
                >
                    {/* Eye outline */}
                    <ellipse cx="155" cy="110" rx="130" ry="80" fill="#f0f9ff" stroke="#94a3b8" strokeWidth="2" />
                    {/* Cornea */}
                    <circle cx="155" cy="110" r="55" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
                    {/* Pupil */}
                    <circle cx="155" cy="110" r="28" fill="#0f172a" />
                    {/* Iris detail */}
                    <circle cx="155" cy="110" r="40" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                    {/* Highlight */}
                    <circle cx="168" cy="97" r="8" fill="white" opacity="0.6" />

                    {/* Labels */}
                    <text x="10" y="110" fontSize="10" fill="#64748b" fontFamily="monospace">Retina</text>
                    <text x="210" y="20" fontSize="10" fill="#64748b" fontFamily="monospace">Cornea</text>
                    <text x="100" y="175" fontSize="10" fill="#64748b" fontFamily="monospace">Iris</text>
                    <text x="138" y="115" fontSize="10" fill="white" fontFamily="monospace">Pupil</text>

                    {/* Quadrant markers */}
                    <line x1="155" y1="32" x2="155" y2="188" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="26" y1="110" x2="284" y2="110" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Drawn paths */}
                    {paths.map((p, i) => (
                        <path key={i} d={p.d} stroke={p.color} strokeWidth={p.width} fill="none"
                            strokeLinecap="round" strokeLinejoin="round" />
                    ))}
                    {currentPath && (
                        <path d={currentPath} stroke={tool === 'eraser' ? 'white' : activeColor}
                            strokeWidth={tool === 'eraser' ? 16 : 3} fill="none"
                            strokeLinecap="round" strokeLinejoin="round" />
                    )}
                </svg>
            </div>
        </div>
    );
}

// ─── Searchable Medicine Dropdown ──────────────────────────────────────────────
function MedicineSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const filtered = MEDICINES.filter(m => m.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                    value={query}
                    onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search medicine..."
                    className="pl-9 bg-white border-slate-200 h-10 text-slate-900 text-sm"
                />
            </div>
            {open && filtered.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                    {filtered.map(m => (
                        <button
                            key={m} type="button"
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 font-medium transition-colors"
                            onMouseDown={() => { onChange(m); setQuery(m); setOpen(false); }}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Prescription Row ──────────────────────────────────────────────────────────
function PrescriptionRow({
    index, field, onRemove, control, watch
}: {
    index: number; field: any; onRemove: () => void;
    control: any; watch: (name: string) => any;
}) {
    const dosage = watch(`prescription.${index}.dosage`) || 1;
    const selectedFreq: string[] = watch(`prescription.${index}.frequency`) || [];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rx {index + 1}</span>
                <button type="button" onClick={onRemove} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Medicine */}
            <Controller name={`prescription.${index}.medicine`} control={control}
                render={({ field }) => <MedicineSearch value={field.value} onChange={field.onChange} />}
            />

            {/* Dosage + Unit + Route */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Dosage counter */}
                <div className="flex items-center gap-2">
                    <Controller name={`prescription.${index}.dosage`} control={control}
                        render={({ field }) => (
                            <>
                                <button type="button"
                                    onClick={() => field.onChange(Math.max(0.5, field.value - 0.5))}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-all">
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-10 text-center text-sm font-bold text-slate-900">{field.value}</span>
                                <button type="button"
                                    onClick={() => field.onChange(field.value + 0.5)}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-all">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </>
                        )}
                    />
                    <Controller name={`prescription.${index}.unit`} control={control}
                        render={({ field }) => (
                            <select value={field.value} onChange={e => field.onChange(e.target.value)}
                                className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                <option value="tab">tab</option>
                                <option value="drop">drop</option>
                                <option value="mg">mg</option>
                            </select>
                        )}
                    />
                    <Controller name={`prescription.${index}.route`} control={control}
                        render={({ field }) => (
                            <select value={field.value} onChange={e => field.onChange(e.target.value)}
                                className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                <option value="oral">Oral</option>
                                <option value="topical">Topical</option>
                                <option value="injection">Injection</option>
                            </select>
                        )}
                    />
                </div>
            </div>

            {/* Frequency Chips */}
            <Controller name={`prescription.${index}.frequency`} control={control}
                render={({ field }) => (
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
                        <div className="flex gap-2 flex-wrap">
                            {FREQUENCIES.map(f => (
                                <button
                                    key={f} type="button"
                                    onClick={() => {
                                        const curr: string[] = field.value || [];
                                        field.onChange(curr.includes(f) ? curr.filter(x => x !== f) : [...curr, f]);
                                    }}
                                    className={cn(
                                        'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                                        (field.value || []).includes(f)
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            />

            {/* Duration */}
            <Controller name={`prescription.${index}.duration`} control={control}
                render={({ field }) => (
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                        <div className="flex gap-2 flex-wrap">
                            {['3 days', '5 days', '7 days', '14 days', '1 month', '3 months', 'Lifelong'].map(d => (
                                <button key={d} type="button"
                                    onClick={() => field.onChange(d)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all',
                                        field.value === d
                                            ? 'bg-sky-600 text-white border-sky-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                                    )}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            />
        </div>
    );
}

// ─── Main Consultation Template ────────────────────────────────────────────────
interface ConsultationTemplateProps {
    patient: Patient;
    onSaveAndMove?: () => void;
}

export function ConsultationTemplate({ patient, onSaveAndMove }: ConsultationTemplateProps) {
    const { saveConsultationData, movePatientToNextZone } = useStore();
    const existing = patient.consultationData;

    const { control, handleSubmit, watch, formState: { errors } } = useForm<ConsultationFormType>({
        resolver: zodResolver(ConsultationSchema),
        defaultValues: {
            hpi: existing?.hpi || '',
            diagnosis: existing?.diagnosis || '',
            diagnosisCode: existing?.diagnosisCode || '',
            eyeFindings: existing?.eyeFindings || '',
            prescription: existing?.prescription || [],
            followUpDays: existing?.followUpDays || 30,
            referral: existing?.referral || '',
            notes: existing?.notes || '',
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'prescription' });

    const addRxItem = () => {
        append({
            id: crypto.randomUUID(),
            medicine: '',
            dosage: 1,
            unit: 'drop',
            frequency: ['Morning', 'Night'],
            duration: '7 days',
            route: 'topical',
        });
    };

    const onSubmit = (data: ConsultationFormType) => {
        const cleaned = {
            ...data,
            diagnosisCode: data.diagnosisCode ?? '',
            eyeFindings: data.eyeFindings ?? '',
            referral: data.referral ?? '',
            notes: data.notes ?? '',
            savedAt: new Date().toISOString(),
        };
        saveConsultationData(patient.id, cleaned);
    };

    const handleSaveAndMove = handleSubmit((data) => {
        saveConsultationData(patient.id, {
            ...data,
            diagnosisCode: data.diagnosisCode ?? '',
            eyeFindings: data.eyeFindings ?? '',
            referral: data.referral ?? '',
            notes: data.notes ?? '',
            savedAt: new Date().toISOString(),
        });
        movePatientToNextZone(patient.id);
        onSaveAndMove?.();
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Consultation Template</h3>
                        <p className="text-xs text-slate-500 font-medium">Hybrid model · HPI + Diagnosis + Rx Builder</p>
                    </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold">
                    {patient.token} · {patient.name}
                </Badge>
            </div>

            {/* HPI */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    History of Presenting Illness (HPI)
                </label>
                <Controller name="hpi" control={control}
                    render={({ field }) => (
                        <Textarea {...field} rows={4}
                            placeholder="Patient presents with... Chief complaint is... Duration of symptoms... Associated symptoms include..."
                            className="bg-white border-slate-200 resize-none text-slate-900 text-sm focus-visible:ring-emerald-500"
                        />
                    )}
                />
                {errors.hpi && <p className="text-xs text-red-600 font-medium">{errors.hpi.message}</p>}
            </div>

            {/* Diagnosis */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Diagnosis</label>
                <Controller name="diagnosis" control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-3 gap-2">
                            {DIAGNOSIS_OPTIONS.map(d => (
                                <button key={d} type="button" onClick={() => field.onChange(d)}
                                    className={cn(
                                        'px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all leading-snug',
                                        field.value === d
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                    )}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    )}
                />
                {errors.diagnosis && <p className="text-xs text-red-600 font-medium">{errors.diagnosis.message}</p>}
            </div>

            {/* Eye Diagram */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Eye Diagram — Mark Findings
                </label>
                <Controller name="eyeFindings" control={control}
                    render={({ field }) => (
                        <EyeDiagramCanvas value={field.value ?? ''} onChange={field.onChange} />
                    )}
                />
            </div>

            {/* Prescription Builder */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Prescription</label>
                    <Button type="button" onClick={addRxItem} size="sm"
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-none text-xs font-bold"
                        variant="outline">
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Medicine
                    </Button>
                </div>
                {fields.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium text-sm">
                        No medicines added yet. Click "Add Medicine" to start.
                    </div>
                )}
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <PrescriptionRow
                            key={field.id}
                            index={index}
                            field={field}
                            onRemove={() => remove(index)}
                            control={control}
                            watch={watch}
                        />
                    ))}
                </div>
            </div>

            {/* Follow Up */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Follow-up After</label>
                <Controller name="followUpDays" control={control}
                    render={({ field }) => (
                        <div className="flex gap-2 flex-wrap">
                            {FOLLOW_UP_OPTIONS.map(d => (
                                <button key={d} type="button" onClick={() => field.onChange(d)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl border text-sm font-bold transition-all',
                                        field.value === d
                                            ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                                    )}
                                >
                                    {d} days
                                </button>
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Clinical Notes</label>
                <Controller name="notes" control={control}
                    render={({ field }) => (
                        <Textarea {...field} rows={2}
                            placeholder="Any additional clinical notes..."
                            className="bg-white border-slate-200 resize-none text-slate-900 text-sm focus-visible:ring-emerald-500"
                        />
                    )}
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button type="submit" variant="outline" className="border-slate-300 text-slate-700 bg-white">
                    Save Consultation
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveAndMove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 h-12 px-8 font-bold text-base"
                >
                    Save & Complete Consultation
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </form>
    );
}
