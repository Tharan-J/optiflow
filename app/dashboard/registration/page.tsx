'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Sparkles, Printer, UserPlus, CheckCircle2, History, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function RegistrationDesk() {
    const { addPatient } = useStore();

    const [age, setAge] = useState('');
    const [symptoms, setSymptoms] = useState<string>('');

    // AI Simulation Logic
    const hasDiabetes = symptoms.toLowerCase().includes('diabet');
    const hasFlashes = symptoms.toLowerCase().includes('flash');
    const ageInt = parseInt(age) || 30;

    let complexity = 2;
    if (ageInt > 60) complexity += 2;
    if (hasDiabetes) complexity += 3;
    if (hasFlashes) complexity += 4;

    const compColor = complexity > 7 ? 'text-red-700 border-red-300 bg-red-50' : complexity > 4 ? 'text-amber-700 border-amber-300 bg-amber-50' : 'text-emerald-700 border-emerald-300 bg-emerald-50';
    const recPath = hasFlashes ? 'Retina Express' : hasDiabetes ? 'Comprehensive Dilation' : 'Standard Routine';

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const ts = Date.now().toString().slice(-4);
        const journey: import('@/lib/store').Department[] = ['Registration', 'Refraction', 'Dilation', 'Consultation'];
        addPatient({
            id: `new-${ts}`,
            name: 'New Patient',
            token: `B${ts}`,
            age: ageInt,
            gender: 'M' as const,
            phone: '',
            symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
            complexityScore: Math.min(10, complexity),
            currentDepartment: 'Refraction',
            status: 'WAITING',
            estimatedWaitTime: 18,
            history: hasDiabetes ? ['Diabetes'] : [],
            allergies: [],
            enteredZoneAt: new Date().toISOString(),
            journey,
            timeline: journey.map((dept, i) => ({
                department: dept,
                status: i === 0 ? 'done' : i === 1 ? 'current' : 'next',
                completedAt: i === 0 ? new Date().toISOString() : undefined,
                enteredAt: i === 1 ? new Date().toISOString() : undefined,
            })),
        });
        setAge('');
        setSymptoms('');
    };

    return (
        <ProtectedRoute allowedRoles={['MANAGER', 'STAFF']}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Registration</h2>
                        <p className="text-slate-500 mt-1 text-sm">Shadow Triage & Token Generation.</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300 shadow-sm font-semibold">
                        <Sparkles className="w-4 h-4 mr-2" /> AI Triage Active
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-5">
                    <form onSubmit={handleRegister} className="col-span-3 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm border border-emerald-200 flex-shrink-0">
                                    <UserPlus className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Patient Information</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <Input required placeholder="Jane Doe" className="bg-slate-50 border-slate-200 h-12 text-slate-900 focus-visible:ring-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <Input required type="tel" placeholder="+1 (555) 000-0000" className="bg-slate-50 border-slate-200 h-12 text-slate-900 focus-visible:ring-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Age</label>
                                    <Input required type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Years" className="bg-slate-50 border-slate-200 h-12 text-slate-900 focus-visible:ring-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Medical ID (Optional)</label>
                                    <Input placeholder="OPT-XXXX" className="bg-slate-50 border-slate-200 h-12 text-slate-900 focus-visible:ring-emerald-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                                    Presenting Symptoms
                                    <span className="text-xs text-slate-500">Comma separated</span>
                                </label>
                                <Textarea
                                    required
                                    value={symptoms}
                                    onChange={e => setSymptoms(e.target.value)}
                                    placeholder="e.g. blurry vision, diabetes, flashes"
                                    className="bg-slate-50 border-slate-200 resize-none h-24 text-slate-900 focus-visible:ring-emerald-500 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <Button type="button" variant="outline" className="bg-white border-slate-300 hover:bg-slate-50 h-12 px-6 text-slate-700 shadow-sm">
                                Clear
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 h-12 px-6 font-semibold">
                                Generate Token
                            </Button>
                        </div>
                    </form>

                    <div className="col-span-2 space-y-6">
                        <Card className="bg-sky-50 border border-sky-100 rounded-xl shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-sky-200 transition-colors"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sky-800 flex items-center gap-2 text-sm uppercase tracking-wider font-bold">
                                    <Zap className="w-4 h-4 fill-sky-200 text-sky-500" /> Live Prediction
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Predicted Complexity</p>
                                    <div className="flex items-end gap-3">
                                        <span className={cn("text-4xl font-extrabold tracking-tighter", compColor.split(' ')[0])}>
                                            {Math.min(10, complexity)}<span className="text-lg text-slate-400">/10</span>
                                        </span>
                                        <Badge className={cn("mb-1 font-bold", compColor)}>
                                            {complexity > 7 ? 'High Risk' : complexity > 4 ? 'Standard' : 'Routine'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-sky-100">
                                    <p className="text-sm font-medium text-slate-600">AI Suggested Pathway</p>
                                    <Badge className={cn("text-sm py-1.5 px-3 mt-1", complexity > 7 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse shadow-sm shadow-emerald-500/10' : 'bg-white text-emerald-700 border-emerald-200 shadow-sm')}>
                                        {recPath} {complexity > 7 && <span className="ml-2 font-bold">(High Priority)</span>}
                                    </Badge>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-sky-100">
                                    <p className="text-sm font-medium text-slate-600 mb-2">Pre-allocated Resources</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white rounded-xl p-2 flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                                            <span className="text-xs text-slate-500 font-medium">Refraction</span>
                                            <span className="font-bold text-slate-800 text-xs mt-1">Room 3</span>
                                        </div>
                                        <div className="bg-white rounded-xl p-2 flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                                            <span className="text-xs text-slate-500 font-medium">Doctor Queue</span>
                                            <span className="font-bold text-slate-800 text-xs mt-1">Dr. Smith</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <Button variant="outline" className="w-full justify-start bg-slate-50 border-slate-200 hover:bg-slate-100 h-12 text-slate-700 shadow-sm font-semibold">
                                    <Printer className="mr-3 w-4 h-4 text-emerald-600" /> Print Physical Token
                                </Button>
                                <Button variant="outline" className="w-full justify-start bg-slate-50 border-slate-200 hover:bg-slate-100 h-12 text-slate-700 shadow-sm font-semibold">
                                    <CreditCard className="mr-3 w-4 h-4 text-emerald-600" /> Collect Co-pay
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
