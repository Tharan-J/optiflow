'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Network, Zap, Waves, Activity, Hexagon, ShieldAlert, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AIIntelligence() {
    const predictionData = [
        { time: '14:00', real: 45, sim: 42 },
        { time: '14:30', real: 60, sim: 55 },
        { time: '15:00', sim: 75 },
        { time: '15:30', sim: 90 },
        { time: '16:00', sim: 60 },
        { time: '16:30', sim: 40 },
    ];

    const bottleneckScatter = [
        { name: 'Ref-A', load: 85, lag: 12, size: 400 },
        { name: 'Ref-B', load: 45, lag: 2, size: 200 },
        { name: 'Dil-Wait', load: 95, lag: 25, size: 800 },
        { name: 'Consult-1', load: 60, lag: 8, size: 300 },
        { name: 'Tests', load: 30, lag: 0, size: 100 },
    ];

    return (
        <ProtectedRoute allowedRoles={['MANAGER']}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Flow Intelligence Core</h2>
                        <p className="text-slate-500 mt-1 text-sm">Advanced forecasting and digital twin simulation.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 font-semibold shadow-sm animate-pulse">
                            <Brain className="w-4 h-4 mr-2" /> Model V3.1 Active
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] pointer-events-none"></div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-teal-900 font-semibold">
                                <Waves className="w-5 h-5 text-emerald-600" /> Forecast Timeline
                            </CardTitle>
                            <CardDescription>Predicting total hospital load 2 hours ahead.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={predictionData}>
                                    <defs>
                                        <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#64748b" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="real" stroke="#10B981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                                    <Area type="monotone" dataKey="sim" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorSim)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-4 text-xs font-mono text-slate-600">
                            <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-emerald-500 relative -top-0.5"></span> Actual Load</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-sky-500"></div> Simulated Prediction</div>
                        </div>
                    </Card>

                    <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-teal-900 font-semibold">
                                <Network className="w-5 h-5 text-sky-500" /> Bottleneck Matrix
                            </CardTitle>
                            <CardDescription>Correlating load (%) with latency lag (mins).</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <XAxis type="number" dataKey="load" name="Load %" stroke="#64748b" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                                    <YAxis type="number" dataKey="lag" name="Lag (min)" stroke="#64748b" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <ZAxis type="number" dataKey="size" range={[100, 1500]} />
                                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px' }} />
                                    {bottleneckScatter.map((entry, index) => (
                                        <Scatter key={index} name={entry.name} data={[entry]} fill={entry.load > 90 ? '#F43F5E' : entry.load > 60 ? '#FBBF24' : '#10B981'} fillOpacity={0.8} stroke="#ffffff" strokeWidth={1} />
                                    ))}
                                </ScatterChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="col-span-2 bg-sky-50 border border-sky-100 shadow-sm rounded-xl backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sky-800 font-semibold">
                                <Hexagon className="w-5 h-5 fill-sky-200 text-sky-500" /> Digital Twin Simulation
                            </CardTitle>
                            <CardDescription className="text-sky-900/60">Test scenarios before deploying real-world routing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                {[
                                    { label: '+1 Refraction Room', impact: '-12m wait avg', type: 'positive' },
                                    { label: 'Doctor 3 Late (30m)', impact: '+45m wait avg', type: 'negative' },
                                    { label: 'Route Dil to Tests 1st', impact: '-5m wait avg', type: 'positive' },
                                ].map((sim, idx) => (
                                    <div key={idx} className="bg-white border border-sky-100 p-4 rounded-xl flex flex-col justify-between hover:border-sky-300 cursor-pointer transition-colors shadow-sm">
                                        <p className="font-medium text-sm text-slate-800">{sim.label}</p>
                                        <p className={cn("text-xs font-bold mt-3 font-mono", sim.type === 'positive' ? 'text-emerald-600' : 'text-red-500')}>
                                            Impact: {sim.impact}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4 border-t border-sky-100">
                                <Button className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm px-8">
                                    <Activity className="w-4 h-4 mr-2" /> Run Full Simulation Matrix
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-50 border border-red-200 shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-red-700 flex items-center gap-2 text-sm uppercase font-bold">
                                <ShieldAlert className="w-4 h-4 text-red-600" /> Critical Early Warning
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
                                <p className="font-bold text-red-700 text-sm flex items-center justify-between mb-2">
                                    Dilation Collapse Predicted <Badge className="bg-red-100 text-red-800 px-1.5 py-0 h-5 font-bold text-[10px] border border-red-200 rounded-md">15:15</Badge>
                                </p>
                                <p className="text-xs text-red-900/80 leading-relaxed font-medium">
                                    Incoming wave of high-complexity retina cases will exceed physical seating in Dilation Area B within 45 mins.
                                </p>
                            </div>
                            <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-100 bg-white">
                                <Cpu className="w-4 h-4 mr-2" /> Auto-Deploy Overflows
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}

